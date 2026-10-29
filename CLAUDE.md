# aSteroid – pokyny pro Claude

Před zahájením vývoje načti [AGENTS.md](AGENTS.md), nejnovější záznam v [HANDOFF.md](HANDOFF.md) a dokumentaci dotčené části. Pravidla AGENTS.md platí i pro Claude.

## Aktuální směr potvrzený majitelem

CSS Disca postupně nahradit vlastními SCSS komponentami aSteroidu při zachování současného vzhledu a funkčnosti 1:1 na mobilu i desktopu. Blank mode má ukázat jen styly aSteroidu: kopie CSS Disca (`base-blank.css`) se u obchodníků nenačítá, slouží jen testům a jako reference. Používej existující mixiny a komponenty, původní HTML/třídy/události i JS Shoptetu. Převáděnou část ověřuj v náhledu bez CSS Shoptetu.

Před prací na CSS načti celý [postup migrace a podmínky dokončení](docs/blank-mode.md). Součástí předání musí být evidence převedených částí a zbývajících závislostí. Neoznačuj migraci za dokončenou, dokud všechny stránky neprojdou kontrolami s vypnutým CSS Shoptetu a bez kopie Disca. Vypnutí nativního JS není součást zadání.
