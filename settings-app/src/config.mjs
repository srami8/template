// Konfigurace settings-app. Tajné hodnoty (client secret) se čtou z .env v kořeni repozitáře.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(appRoot, '..');

function readEnvFile() {
  const env = {};
  try {
    for (const line of readFileSync(join(repoRoot, '.env'), 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // Bez .env poběží jen s proměnnými prostředí.
  }
  return env;
}

const env = { ...readEnvFile(), ...process.env };

// Partnerský e-shop, pod kterým je doplněk založený (Propojení → API partner → Přístup k API).
const partnerEshop = env.SHOPTET_PARTNER_ESHOP || 'https://313980.myshoptet.com';

export const config = {
  port: Number(env.PORT) || 8787,
  // Veřejná adresa (tunel / hosting). Bez ní se odvozuje z hlavičky Host požadavku.
  publicUrl: env.PUBLIC_URL || null,

  clientId: env.SHOPTET_CLIENT_ID || 'm66aa8h226fl0e2b',
  clientSecret: env.SHOPTET_CLIENT_SECRET,
  installTokenUrl: `${partnerEshop}/action/ApiOAuthServer/token`,
  apiAccessTokenUrl: `${partnerEshop}/action/ApiOAuthServer/getAccessToken`,
  apiBase: 'https://api.myshoptet.com',

  // Kde na e-shopu leží sestavené theme (npm run deploy).
  assetsBase: env.ASSETS_BASE || '/user/documents/asteroid/',
  // 'dev' = načítat vždy nejnovější soubory (cache busting při každém načtení stránky).
  assetsVersion: env.ASSETS_VERSION || 'dev',

  storeFile: join(appRoot, 'data', 'store.json'),
};

if (!config.clientSecret) {
  throw new Error('V .env chybí SHOPTET_CLIENT_SECRET.');
}
