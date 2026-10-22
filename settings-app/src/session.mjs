// Relace admina bez cookies. Ve vložené stránce (iframe v administraci Shoptetu) prohlížeče cookies
// třetích stran blokují, proto relaci neseme jako podepsaný token v adrese a ve formuláři.
// Token není „ambientní“ jako cookie, takže zároveň slouží jako ochrana proti CSRF.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from './config.mjs';

const TTL = 2 * 60 * 60 * 1000;

// Klíč pro podpis odvozený z client secretu, aby nebylo potřeba další tajemství v .env.
const key = createHmac('sha256', config.clientSecret).update('asteroid-session').digest();

function sign(payload) {
  return createHmac('sha256', key).update(payload).digest('base64url');
}

export function createSessionToken(eshopId) {
  const payload = Buffer.from(JSON.stringify({ e: String(eshopId), x: Date.now() + TTL })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

// Vrátí true, jen když je token platný, nevypršel a patří k danému e-shopu.
export function verifySessionToken(token, eshopId) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  try {
    const { e, x } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return e === String(eshopId) && x > Date.now();
  } catch {
    return false;
  }
}
