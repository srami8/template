// Úložiště instalací doplňku: OAuth token, adresa e-shopu a uložené nastavení šablony.
// Zatím JSON soubor (data/ je v .gitignore), pro ostrý provoz se nahradí databází.

import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.mjs';

function load() {
  try {
    return JSON.parse(readFileSync(config.storeFile, 'utf8'));
  } catch {
    return { installations: {} };
  }
}

function save(data) {
  mkdirSync(dirname(config.storeFile), { recursive: true });
  const tmp = `${config.storeFile}.tmp`;
  // Obsahuje OAuth tokeny, čitelné jen pro vlastníka.
  writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  renameSync(tmp, config.storeFile);
}

export function getInstallation(eshopId) {
  return load().installations[String(eshopId)] || null;
}

export function saveInstallation(eshopId, patch) {
  const data = load();
  const key = String(eshopId);
  data.installations[key] = { ...data.installations[key], ...patch, updatedAt: new Date().toISOString() };
  save(data);
  return data.installations[key];
}
