// Převede SVG ikony ze src/icons na Sass mapu s data URI.
// Ikony se pak v CSS používají jako mask-image, takže přebírají barvu z currentColor
// a celé téma zůstane v jednom CSS souboru bez dalších požadavků na server.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'src/icons');
const outFile = join(root, 'src/scss/generated/_icons.scss');

const entries = readdirSync(iconsDir)
  .filter((file) => file.endsWith('.svg'))
  .sort()
  .map((file) => {
    const svg = readFileSync(join(iconsDir, file), 'utf8')
      .replace(/<\?xml[^>]*>/, '')
      // Atributy z exportu Figmy, které maska nepotřebuje.
      .replace(/\s(id|style|preserveAspectRatio|overflow)="[^"]*"/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    // Kódujeme jen znaky, které v data URI vadí, ať je CSS co nejmenší.
    const uri = `data:image/svg+xml,${svg.replace(/"/g, "'").replace(/[<>#%{}]/g, encodeURIComponent)}`;
    return `  "${basename(file, '.svg')}": "${uri}",`;
  });

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(
  outFile,
  `// Generováno skriptem scripts/build-icons.mjs, needitovat ručně.\n\n$icons: (\n${entries.join('\n')}\n);\n`,
);

console.log(`icons: ${entries.length} → ${outFile}`);
