// Nahraje sestavené soubory z dist/ na SFTP testovacího e-shopu.
// Přístupy čte z .env v kořeni repozitáře (FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_DIR).
//
//   npm run deploy           sestaví a nahraje dist/*
//   npm run deploy -- --ls   jen vypíše obsah cílové složky (pro kontrolu)

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import SftpClient from 'ssh2-sftp-client';

const themeRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(themeRoot, '..');
const distDir = join(themeRoot, 'dist');

// Složka na SFTP, do které nahráváme. Na e-shopu je pak dostupná pod /user/documents/<REMOTE_SUBDIR>/.
const REMOTE_SUBDIR = 'asteroid';

function readEnv() {
  const env = {};
  for (const line of readFileSync(join(repoRoot, '.env'), 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

function connectionOptions(env) {
  const url = new URL(env.FTP_HOST.includes('://') ? env.FTP_HOST : `sftp://${env.FTP_HOST}`);
  return {
    host: url.hostname,
    port: Number(url.port) || 22,
    username: env.FTP_USER,
    password: env.FTP_PASSWORD,
  };
}

async function main() {
  const env = readEnv();
  for (const key of ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD']) {
    if (!env[key]) throw new Error(`V .env chybí ${key}.`);
  }

  const sftp = new SftpClient();
  await sftp.connect(connectionOptions(env));

  try {
    const home = await sftp.cwd();

    if (process.argv.includes('--ls')) {
      const path = process.argv[process.argv.indexOf('--ls') + 1] || home;
      const entries = await sftp.list(path);
      console.log(`${path}:`);
      entries.forEach((e) => console.log(`  ${e.type === 'd' ? 'd' : '-'} ${e.name}`));
      return;
    }

    const remoteDir = `${home.replace(/\/$/, '')}/${REMOTE_SUBDIR}`;
    await sftp.mkdir(remoteDir, true);

    for (const file of readdirSync(distDir)) {
      await sftp.fastPut(join(distDir, file), `${remoteDir}/${file}`);
      console.log(`nahráno: ${REMOTE_SUBDIR}/${file}`);
    }
  } finally {
    await sftp.end();
  }
}

main().catch((error) => {
  // Chybovou hlášku vypisujeme bez přístupových údajů.
  console.error(`deploy selhal: ${error.message}`);
  process.exit(1);
});
