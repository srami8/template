# Kompatibilní základ Disco 13

Snapshot veřejných distribučních souborů Shoptetu z testovacího e-shopu 313980, pořízený 25. 10. 2026. Původním autorem je Shoptet; nejde o nově napsané CSS aSteroidu. Přesné zdroje a SHA256 jsou v `manifest.json`.

- `main.css` je beze změny proti upstream souboru.
- `font-shoptet.css` mění pouze URL `assets/shoptet.*` na sourozenecké `shoptet.*` (výstupy jsou v kořeni dist).
- Fonty jsou původní soubory bez úprav.
- `variants/base-blank.scss` vše sestaví do `base-blank.css`, načítaného před aSteroidem. Build kontroluje manifest a kopíruje fonty.

Ponecháváme celý kompatibilní základ, včetně nákupního procesu a méně častých stavů. Selektory neodstraňovat podle použití pouze na homepage. Před aktualizací porovnat zdroj s dosavadním snapshotem, zkontrolovat případné další URL závislosti, obnovit manifest a ověřit veřejné stránky i nákupní proces. Build nic nestahuje a nezávisí na aktuální verzi CDN.

Vlastní změny vzhledu patří do současných komponent/mixinů, nikoli ručně do minifikovaného vendor souboru. Další postup: [docs/blank-mode.md](../../../../docs/blank-mode.md).
