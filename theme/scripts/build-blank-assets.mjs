// Fonty nativních ikon, které aSteroid zatím nenahrazuje. Bez závislosti na CDN Shoptetu.
// Hash v názvu zajistí novou URL při změně; kopírujeme vedle base-blank.css (deploy bere dist/*).
import { readFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const source = new URL('../src/vendor/disco/', import.meta.url);
const target = new URL('../dist/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', source), 'utf8'));
mkdirSync(target, { recursive: true });
for (const asset of manifest.sources) {
  const bytes = readFileSync(new URL(asset.file, source));
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) {
    throw new Error(`Změněný základ Blank mode: ${asset.file}. Aktualizuj i manifest po kontrole změny.`);
  }
  if (/\.woff2?$/.test(asset.file)) copyFileSync(new URL(asset.file, source), new URL(asset.file, target));
}
console.log(`blank assets: ověřeno ${manifest.sources.length} souborů, fonty → ${fileURLToPath(target)}`);
