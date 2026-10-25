# Články ke kategoriím (issue #1)

Admin v nastavení šablony přiřadí ke kategorii existující články e-shopu. Šablona je na stránce kategorie zobrazí vedle popisu (od 992 px), na užších šířkách pod popisem a před podkategoriemi.

## Jak to funguje

1. **Nastavení** (`settings-app`, karta „Články ke kategoriím“)
   - výběr kategorie, hledání článku podle názvu, pořadí šipkami, odebrání, vlastní nadpis (prázdný = „Články z poradny“), nejvýš 10 článků na kategorii;
   - jeden článek může být u více kategorií;
   - odebrání ruší jen přiřazení, článek v e-shopu zůstává.
2. **Uložení** (`installation.categoryArticles` v úložišti settings-app)
   - jen GUID kategorie a ID článků v pořadí, odděleně pro každý e-shop;
   - název, adresa a zveřejnění článku se neukládají, berou se vždy z API Shoptetu.
3. **Zveřejnění**: veřejný soubor `GET <PUBLIC_URL>/public/<eshopId>/category-articles.json`
   - obsah: `{ "categories": { "<GUID>": { "title": "…", "articles": [{ "title": "…", "url": "/cesta/" }] } } }`;
   - jen články viditelné na webu (`visible`) s datem zveřejnění, které už nastalo; skryté, smazané a budoucí se vynechají, kategorie bez platného článku v souboru není;
   - odpověď: `Cache-Control: public, max-age=300, stale-while-revalidate=86400, stale-if-error=86400`, `Access-Control-Allow-Origin: *`;
   - server data z API obnovuje nejdřív po 10 minutách, na pozadí (návštěvník dostane hned poslední platná data); obnoví je i každé otevření nastavení; po neúspěšném pokusu zkouší znovu nejdřív za minutu (i bez první úspěšné cache);
   - **chyba API nic nemaže**: zůstanou poslední zveřejněná data i uložená přiřazení. Bez první úspěšné cache vrací endpoint HTTP 503, `no-store` a `Retry-After: 60`, aby se výpadek neuložil jako úspěšný prázdný výsledek. Obnova po dokončení API čte aktuální přiřazení z úložiště, takže nepřepíše změnu uloženou během požadavku.
4. **Kód v e-shopu**: do `window.asteroidConfig.categoryArticles` jde jen adresa souboru s verzí `?v=<otisk přiřazení>` (jen když nějaké přiřazení existuje). Po uložení nastavení se tak soubor nevezme z mezipaměti prohlížeče. Samotná data v kódu hlavičky nejsou (limit 8192 znaků).
5. **Šablona** (`theme/src/js/category-articles.js`, styly `components/_category.scss`)
   - kategorii pozná podle `dataLayer[…].shoptet.category.guid` (ne podle názvu ani adresy);
   - soubor stahuje už při čtení hlavičky (dataLayer je před kódem šablony), blok vloží na DOMContentLoaded za `.category-perex` (bez popisu za nadpis);
   - bez platných článků (prázdný soubor, chyba, cizí nebo prázdný odkaz) se blok ani sloupec nevykreslí; blok se nevloží dvakrát;
   - po řazení, filtrování a stránkování (AJAX Shoptetu vymění celou `.category-top`) se blok vloží znovu na `ShoptetDOMPageContentLoaded`, stejně jako pás Nejprodávanějších (`js/category.js`);
   - dlouhé názvy se zalamují, odkazy jsou v `nav` s nadpisem (`aria-labelledby`), ikona `text-snippet`.

## Provozní požadavky

- **Oprávnění doplňku**: čtení článků (`/api/articles`). Bez něj karta v nastavení ukáže hlášku a přiřazení zůstanou beze změny. Přidání oprávnění do doplňku vyžaduje nové schválení u e-shopů.
- **Stálá veřejná adresa settings-app** (`PUBLIC_URL`, HTTPS). Adresa souboru se ukládá při uložení nastavení a zapisuje do kódu e-shopu (i při `npm run deploy`). Ukládá se jen adresa s HTTPS; uložení přes `http://localhost` ponechá předchozí. Dočasný tunel (trycloudflare) po čase vyprší a po restartu má jinou adresu, pak je potřeba nastavení znovu uložit.
- **Zkouška výpadku API**: druhý server s nefunkční adresou API, např. `PORT=8790 SHOPTET_API_BASE=https://api.invalid.test node settings-app/src/server.mjs`.
- **Dostupnost**: když server neběží, blok se nezobrazí (stránka jinak funguje). Prohlížeče drží poslední soubor až 24 h (`stale-if-error`).
- **Zátěž**: jeden požadavek na soubor z každého prohlížeče za 5 minut. API Shoptetu se volá nejvýš jednou za 10 minut na e-shop; seznam článků se stahuje po 10 na stránku, nejvýš 2000 článků.
- **Úložiště**: zatím JSON soubor (`settings-app/data`, mimo git). Pro ostrý provoz databáze.
- **Omezení**: seznam článků v API neříká, jestli je článek jen pro přihlášené (`access` je jen v detailu článku). Takový článek se zobrazí, ale návštěvníka bez přihlášení Shoptet nepustí dál.
- **Změny článků v e-shopu** (přejmenování, skrytí, smazání, budoucí zveřejnění) se na e-shopu projeví nejpozději asi za 15 minut (obnova na serveru + mezipaměť prohlížeče), bez nového uložení.

## Převod ručně psaných článků z popisů kategorií

Šablona popisy kategorií nikdy nemění a články vepsané do popisu nepřesouvá ani nemaže. Postup pro admina:

1. V administraci (Kategorie → kategorie → Popis) najít odkazy na články vepsané do popisu.
2. Stejné články přiřadit ke kategorii v nastavení šablony (karta „Články ke kategoriím“), ve stejném pořadí, a uložit.
3. Na e-shopu zkontrolovat, že se blok článků zobrazuje (do 5 minut, případně obnovit stránku).
4. Teprve potom ručně odstranit odkazy z popisu kategorie, aby nebyly na stránce dvakrát.
5. U článků, které v e-shopu neexistují (odkaz na smazanou stránku), odkaz v popisu jen smazat.

## Ověření

- `npm test -w settings-app`: přiřazení z formuláře (pořadí, duplicity, neplatné GUID / ID, limit), stavy článku (zveřejněný, skrytý, budoucí, smazaný), zveřejněná data (pořadí, cesty bez domény, výchozí nadpis, jeden článek u více kategorií, přejmenování), verze a hlášky chyb.
- `tests/responsive/category.spec.cjs`: blok vedle popisu (desktop) a pod ním před podkategoriemi (telefon), pořadí, ikona, zalomení dlouhého názvu, žádný blok ani sloupec bez platných článků nebo při chybě souboru.
- Na e-shopu 313980 (3 testovací články, 24. 10. 2026), desktop 1920 i telefon 390:
  - 0 článků (Dárky): bez bloku i sloupce; 1 článek (Náramky, bez popisu: blok za nadpisem); 3 články (Šperky);
  - pořadí a vlastní nadpis po uložení hned; jeden článek u dvou kategorií; dlouhý název se zalamuje;
  - blok za popisem a před podkategoriemi; posun obsahu (CLS) stejný jako u kategorie bez bloku;
  - výpadek API: soubor dál vrací poslední data, přiřazení zůstala, nastavení ukáže hlášku a přiřazení drží ve skrytých polích, jen jeden pokus o API za minutu;
  - řazení (AJAX): blok i Nejprodávanější se vrátí. Kategorie nemá parametrické filtry, filtrování proto vyzkoušené jen testem na stejné události.
- Zatím neověřeno naživo (logiku hlídají testy): přejmenování, skrytí, smazání a budoucí zveřejnění článku. Stačí v administraci článek upravit a do 15 minut zkontrolovat kategorii.
- Ikony mají primární barvu z administrace e-shopu (na testovacím e-shopu `#141615`, proto tmavé, ve Figmě modré).
