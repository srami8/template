// Volání Shoptetu: instalace doplňku, API tokeny, Shoptet API a ověření admina přes OAuth.

import { createHash } from 'node:crypto';
import { config } from './config.mjs';
import { getApiToken, saveApiToken } from './store.mjs';

async function readJson(response, what) {
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`${what}: neočekávaná odpověď (HTTP ${response.status})`);
  }
  if (!response.ok) {
    const detail = String(body.error_description || body.error || body.errors?.[0]?.message || '')
      // Shoptet do některých chybových hlášek vkládá samotný token, do logu ho nepouštíme.
      .replace(/"[^"]*\d+-[a-z]-\d+-[a-z0-9]+[^"]*"/gi, '"…"');
    throw new Error(`${what}: HTTP ${response.status} ${detail}`.trim());
  }
  return body;
}

// Instalace: výměna jednorázového `code` za trvalý OAuth token instalace.
export async function exchangeInstallCode(code, redirectUri) {
  const response = await fetch(config.installTokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      scope: 'api',
    }),
  });
  return readJson(response, 'Výměna instalačního kódu');
}

// Krátkodobé API tokeny (platí 30 minut) si ukládáme, Shoptet povoluje max. 5 platných současně.
function tokenKey(oauthToken) {
  return createHash('sha256').update(oauthToken).digest('hex').slice(0, 16);
}

async function getApiAccessToken(oauthToken, { fresh = false } = {}) {
  const key = tokenKey(oauthToken);
  const cached = getApiToken(key);
  if (!fresh && cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const response = await fetch(config.apiAccessTokenUrl, {
    headers: { Authorization: `Bearer ${oauthToken}` },
  });
  const body = await readJson(response, 'Získání API tokenu');
  saveApiToken(key, {
    token: body.access_token,
    expiresAt: Date.now() + (Number(body.expires_in) || 1800) * 1000,
  });
  return body.access_token;
}

export async function api(installation, method, path, payload) {
  const request = (token) =>
    fetch(`${config.apiBase}${path}`, {
      method,
      headers: {
        'Shoptet-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

  let response = await request(await getApiAccessToken(installation.oauthToken));
  // Uložený token může Shoptet zneplatnit dřív (např. přeinstalace doplňku), nebo nemá práva přidaná
  // v nastavení doplňku po jeho vydání (403). Vezmeme nový a zkusíme to znovu.
  if (response.status === 401 || response.status === 403) {
    response = await request(await getApiAccessToken(installation.oauthToken, { fresh: true }));
  }
  return readJson(response, `${method} ${path}`);
}

export function getEshopInfo(installation) {
  return api(installation, 'GET', '/api/eshop');
}

// Všechny kategorie produktů e-shopu (stránkování po 1000, víc kategorií mají e-shopy výjimečně).
export async function getCategories(installation) {
  const categories = [];
  for (let page = 1; page <= 20; page += 1) {
    const body = await api(installation, 'GET', `/api/categories?itemsPerPage=1000&page=${page}`);
    categories.push(...(body.data?.categories ?? []));
    if (page >= (body.data?.paginator?.pageCount ?? 1)) break;
  }
  return categories;
}

export function setHeaderSnippet(installation, html) {
  return api(installation, 'POST', '/api/template-include', {
    data: { snippets: [{ location: 'common-header', html }] },
  });
}

// Ověření admina e-shopu (scope basic_eshop) pro stránku nastavení.
export function adminAuthorizeUrl(oauthBase, { state, redirectUri }) {
  const params = new URLSearchParams({
    client_id: config.clientId,
    scope: 'basic_eshop',
    state,
    response_type: 'code',
    redirect_uri: redirectUri,
  });
  return `${oauthBase}authorize?${params}`;
}

export async function verifyAdmin(oauthBase, { code, redirectUri }) {
  const tokenResponse = await fetch(`${oauthBase}token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      scope: 'basic_eshop',
    }),
  });
  const { access_token: accessToken } = await readJson(tokenResponse, 'Ověření admina');

  const eshopResponse = await fetch(`${oauthBase}resource?method=getBasicEshop`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await readJson(eshopResponse, 'Údaje o e-shopu');
  if (!body.success) throw new Error(`Údaje o e-shopu: ${body.error_description || body.error}`);
  return body.data;
}
