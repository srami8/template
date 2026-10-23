# Zadání šablony aSteroid

Designová šablona pro Shoptet nad šablonou **Disco**, prodávaná jako doplněk na marketplace.
Návrh: [Figma – aSteroid](https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid).

## Hlavní principy

### 1. Barvy a fonty z administrace e-shopu

Obchodník si barvy a fonty nastavuje v administraci Shoptetu (Vzhled a obsah). Šablona je **přebírá** a Figma slouží jen jako výchozí podoba a ukázka rozložení, ne jako pevně dané hodnoty.

Shoptet je dává k dispozici jako CSS proměnné na `<html>` ([dokumentace](https://developers.shoptet.com/shoptet-tools/editing-templates/placeholders-not-only-for-template-colors/)):

| Proměnná Shoptetu | V administraci | Použití v šabloně |
|---|---|---|
| `--color-primary` (+ `-h`, `-s`, `-l`) | Barva šablony 1 | hlavní barva: odkazy, aktivní stavy, tlačítka, štítky „Novinka“; světlé a tmavé odstíny se dopočítají z `-h/-s/-l` |
| `--color-primary-hover` | Barva šablony 2 | hover hlavní barvy |
| `--color-secondary` (+ `-hover`) | Konverzní barva | konverzní prvky: košík, „Do košíku“, „Pokračovat v objednávce“ |
| `--color-tertiary` (+ `-hover`) | Barva šablony 3 a 4 | doplňková barva (pozadí sekcí, zvýraznění) |
| `--template-font` | Písmo textu | font celé šablony |
| `--template-headings-font` | Písmo nadpisů | nadpisy, názvy produktů, tlačítka |
| `--color-header-background`, `--header-background-url` | Pozadí hlavičky | pozadí hlavičky |

Pravidla:
- Šablona nepoužívá pevné barvy z Figmy tam, kde má Shoptet odpovídající nastavení. Tokeny `--as-*` se z proměnných Shoptetu **odvozují** a hodnoty z Figmy slouží jen jako záloha, když proměnná chybí.
- Neutrální barvy (texty, šedé, okraje, pozadí stránky) Shoptet nenastavuje, ty zůstávají podle Figmy.
- Stavové barvy, které nastavuje obchodník (barva dostupnosti, barvy příznaků produktů), se nepřepisují.
- Šablona si sama nenačítá font z Google Fonts. Font zvolený v administraci načítá Shoptet.

### 2. Maximum obsahu z administrace e-shopu

Šablona používá především to, co Shoptet sám vykresluje podle administrace: logo, hlavní a horní menu, kategorie, bannery, informační proužek, kontakty, měny a jazyky, produkty, příznaky, dostupnosti, ceny, patičku, recenze, blog.

Nastavení doplňku (settings-app) obsahuje jen to, co Shoptet nemá:
- volbu varianty (hlavička, layout kategorie…),
- doplňkové texty, které v administraci nejsou (např. otevírací doba u telefonu),
- prvky z návrhu, které Shoptet nevykresluje (např. rychlé odkazy pod hlavičkou).

U každého nového prvku se nejdřív ověří, jestli ho jde naplnit z administrace. Vlastní nastavení je až druhá možnost. Duplicitní údaje (telefon, e-mail, logo) se nikdy nezadávají podruhé.

### Přehled zdrojů (stav k 23. 10. 2026)

| Prvek | Zdroj |
|---|---|
| Barvy (hlavní, hover, konverzní, doplňková) | administrace (`--color-*`), odstíny dopočítané |
| Písmo textu a nadpisů | administrace (`--template-font`, `--template-headings-font`) |
| Pozadí hlavičky a světlý / tmavý text v ní | administrace (`--color-header-background`, třída `.header-background-light/dark`) |
| Logo, hlavní a horní menu, kategorie v katalogu | administrace |
| Telefon v horní liště, kontakt v našeptávači (fotka, e-mail, telefon) | kontaktní údaje e-shopu |
| Výběr měny, košík, přihlášení | Shoptet |
| Výsledky našeptávače, barvy dostupnosti | Shoptet / administrace |
| Varianta hlavičky, otevírací doba, rychlé odkazy, odkazy vedle katalogu (v2) | nastavení doplňku (v Shoptetu nejsou) |

Dál z administrace půjde brát (při kódování dalších částí):
- informační proužek nad hlavičkou (Figma „Lišta“),
- bannery na úvodní stránce a výhody obchodu („Doprava zdarma“…),
- příznaky produktů (Novinka, Akce, Tip…) včetně barev nastavených obchodníkem místo pevných barev z Figmy,
- patička: kontakty, sociální sítě, platební metody, odkazy na stránky.

## Postup vývoje

Komponenta po komponentě, pak skládání stránek:

1. **Základ:** tokeny barev a fontů napojené na administraci (viz výše).
2. **Sdílené komponenty:** tlačítka, štítky, cena, karta produktu, formuláře, drobečková navigace, stránkování. Každá se nakóduje nad markupem Disco a ověří na všech místech, kde ji Shoptet vykresluje.
3. **Hlavička a patička** (společné pro všechny stránky).
4. **Stránky podle typu:** úvod, kategorie, detail produktu, košík a objednávka, účet, obsahové stránky a blog. Skládají se z hotových komponent a doplňuje se jen rozložení.

Každý krok: návrh ve Figmě (desktop i mobil) → markup Disco na testovacím e-shopu → kód → nasazení (`npm run deploy`) → ověření v prohlížeči na 1920 px a na mobilu → commit.
