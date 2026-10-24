// Nastavení šablony (src/theme-config.mjs): vlastní barva pozadí popisu kategorie.
//
//   npm test -w settings-app

import { test } from 'node:test';
import assert from 'node:assert/strict';

// config.mjs vyžaduje client secret (jinak .env), pro testy stačí libovolný.
process.env.SHOPTET_CLIENT_SECRET ||= 'test';
const { themeConfigFromForm, rootStyle, isDarkColor } = await import('../src/theme-config.mjs');

const form = (entries) => new URLSearchParams(entries);

test('custom background colour is stored only when chosen and valid', () => {
  const base = [['categoryLayout', 'image'], ['categoryTint', '1']];
  let c = themeConfigFromForm(form([...base, ['categoryTintMode', 'custom'], ['categoryTintColor', '#FFE8D6']]));
  assert.deepEqual([c.categoryTint, c.categoryTintColor, c.categoryTintDark], [true, '#ffe8d6', false]);

  c = themeConfigFromForm(form([...base, ['categoryTintMode', 'primary'], ['categoryTintColor', '#ffe8d6']]));
  assert.equal(c.categoryTintColor, null);

  c = themeConfigFromForm(form([...base, ['categoryTintMode', 'custom'], ['categoryTintColor', 'red;}body{display:none']]));
  assert.equal(c.categoryTintColor, null);

  // Pozadí jde zapnout jen u vzhledů s obrázkem vedle textu.
  c = themeConfigFromForm(form([['categoryLayout', 'background'], ['categoryTint', '1']]));
  assert.equal(c.categoryTint, false);
});

test('dark colours switch the text to white', () => {
  assert.equal(isDarkColor('#1e3a5f'), true);
  assert.equal(isDarkColor('#141615'), true);
  assert.equal(isDarkColor('#e9f6fd'), false);
  assert.equal(isDarkColor('#ffba34'), false);
  const c = themeConfigFromForm(form([['categoryLayout', 'image-wide'], ['categoryTint', '1'], ['categoryTintMode', 'custom'], ['categoryTintColor', '#1e3a5f']]));
  assert.equal(c.categoryTintDark, true);
});

test('the colour goes to the inserted code together with heading sizes', () => {
  assert.equal(rootStyle({ headings: {}, categoryTint: false, categoryTintColor: '#ffe8d6' }), '');
  assert.equal(rootStyle({ headings: {}, categoryTint: true, categoryTintColor: '#ffe8d6' }), '<style>:root{--as-category-tint:#ffe8d6}</style>');
  assert.equal(rootStyle({ headings: { h1: 40 }, categoryTint: true, categoryTintColor: '#ffe8d6' }),
    '<style>:root{--as-heading-size-h1:40px;--as-category-tint:#ffe8d6}</style>');
});
