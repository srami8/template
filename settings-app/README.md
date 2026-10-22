# settings-app

Stránka nastavení doplňku aSteroid. Node.js 18+, bez závislostí.

## Co dělá

| Cesta | Kdo ji volá | Co dělá |
|---|---|---|
| `GET /install?code=…` | Shoptet při instalaci doplňku | Vymění `code` za OAuth token instalace, uloží ho a vloží do e-shopu výchozí nastavení šablony. |
| `GET /settings?eshopId=…` | Admin z administrace („Přejít na nastavení doplňku“) | Ověří admina přes OAuth (`basic_eshop`) a zobrazí formulář nastavení. |
| `GET /auth/callback` | Shoptet po ověření admina | Ověří, že přihlášený účet patří k e-shopu, a založí relaci. |
| `POST /settings?eshopId=…` | Formulář nastavení | Uloží nastavení a přes API `template-include` (pozice `common-header`) vloží do e-shopu `window.asteroidConfig` a načtení CSS/JS šablony. |

Instalace (OAuth tokeny a uložené nastavení) se ukládají do `data/store.json`. Soubor se necommituje a pro ostrý provoz ho nahradí databáze.

## Spuštění při vývoji

```bash
npm run settings   # server na http://localhost:8787
npm run tunnel     # dočasná veřejná adresa přes Cloudflare (https://….trycloudflare.com)
```

`npm run tunnel` potřebuje `cloudflared` ve složce `.tools/` (necommituje se). Adresa tunelu se při každém spuštění mění a je potřeba ji přepsat v nastavení doplňku.

Potřebné hodnoty v `.env` v kořeni repozitáře:

- `SHOPTET_CLIENT_SECRET`: OAuth Client secret (Propojení → API partner → Přístup k API)
- volitelně `SHOPTET_CLIENT_ID`, `SHOPTET_PARTNER_ESHOP`, `PUBLIC_URL`, `PORT`, `ASSETS_VERSION`

## Nastavení doplňku v administraci partnerského e-shopu

Propojení → API partner → Doplňky → doplněk aSteroid:

- **URL pro získání OAuth kódu (instalace):** `<veřejná adresa>/install`
- **URL pro autorizaci uživatele:** `<veřejná adresa>/auth/callback`
- **Addon settings url:** `<veřejná adresa>/settings?eshopId=#SHOP_ID#`
- **Práva:** HTML kódy v šabloně (template-include) zápis, informace o e-shopu čtení
