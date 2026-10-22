// Settings-app doplňku aSteroid.
//
//   GET  /install?code=…        instalace doplňku (volá Shoptet ze svých serverů)
//   GET  /settings?eshopId=…    stránka nastavení (Addon settings url), vyžaduje ověřeného admina
//   GET  /auth/callback         návrat z OAuth ověření admina
//   POST /settings?eshopId=…    uložení nastavení a vložení kódu do e-shopu přes API

import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from './config.mjs';
import { getInstallation, saveInstallation } from './store.mjs';
import {
  exchangeInstallCode,
  getEshopInfo,
  setHeaderSnippet,
  adminAuthorizeUrl,
  verifyAdmin,
} from './shoptet.mjs';
import { DEFAULT_THEME_CONFIG, themeConfigFromForm, buildHeaderSnippet } from './theme-config.mjs';
import { settingsPage, messagePage } from './views.mjs';

const SESSION_TTL = 2 * 60 * 60 * 1000;
const STATE_TTL = 10 * 60 * 1000;

// Přihlášení adminové a rozpracovaná OAuth ověření. V paměti stačí: po restartu se admin ověří znovu.
const sessions = new Map(); // sessionId → { eshopId, csrf, expiresAt }
const pendingStates = new Map(); // state → { eshopId, expiresAt }

function token() {
  return randomBytes(24).toString('base64url');
}

function publicUrl(req) {
  if (config.publicUrl) return config.publicUrl.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${req.headers.host}`;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', ...headers });
  res.end(body);
}

function redirect(res, location, headers = {}) {
  res.writeHead(302, { Location: location, ...headers });
  res.end();
}

function readCookie(req, name) {
  const match = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

function getSession(req, eshopId) {
  const session = sessions.get(readCookie(req, 'asteroid_session'));
  if (!session || session.expiresAt < Date.now() || session.eshopId !== String(eshopId)) return null;
  return session;
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

async function readForm(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 50_000) throw new Error('Příliš velký formulář.');
  }
  return new URLSearchParams(body);
}

// Instalace: uložíme OAuth token a hned odpovíme 200 (Shoptet čeká max. 5 s).
// Zjištění údajů o e-shopu a výchozí kód do šablony doběhnou až potom.
async function handleInstall(req, res, url) {
  const code = url.searchParams.get('code');
  if (!code) return send(res, 400, 'Chybí code.');

  const redirectUri = `${publicUrl(req)}/install`;
  const result = await exchangeInstallCode(code, redirectUri);
  const installation = saveInstallation(result.eshopId, {
    oauthToken: result.access_token,
    eshopUrl: result.eshopUrl,
    installedAt: new Date().toISOString(),
  });
  send(res, 200, 'OK');
  console.log(`instalace: e-shop ${result.eshopId} (${result.eshopUrl})`);

  finishInstall(result.eshopId, installation).catch((error) =>
    console.error(`instalace e-shopu ${result.eshopId}: ${error.message}`),
  );
}

async function finishInstall(eshopId, installation) {
  const { data } = await getEshopInfo(installation);
  const oauthUrl = data.urls?.find((u) => u.ident === 'oauth')?.url;
  const updated = saveInstallation(eshopId, {
    eshopName: data.contactInformation?.eshopName || data.name || installation.eshopUrl,
    oauthBase: oauthUrl || `${installation.eshopUrl.replace(/\/$/, '')}/action/OAuthServer/`,
    themeConfig: installation.themeConfig || DEFAULT_THEME_CONFIG,
  });
  await setHeaderSnippet(updated, buildHeaderSnippet(updated.themeConfig));
  console.log(`instalace: e-shop ${eshopId} má výchozí nastavení šablony`);
}

async function handleSettingsGet(req, res, url) {
  const eshopId = url.searchParams.get('eshopId');
  const installation = eshopId && getInstallation(eshopId);
  if (!installation) {
    return send(res, 404, messagePage('Doplněk není nainstalovaný', 'Pro tento e-shop nemáme instalaci doplňku aSteroid.'));
  }

  const session = getSession(req, eshopId);
  if (!session) {
    const state = token();
    pendingStates.set(state, { eshopId: String(eshopId), expiresAt: Date.now() + STATE_TTL });
    return redirect(res, adminAuthorizeUrl(installation.oauthBase, { state, redirectUri: `${publicUrl(req)}/auth/callback` }));
  }

  const flash = url.searchParams.get('saved') === '1' ? { type: 'ok', message: 'Uloženo, e-shop už používá nové nastavení.' } : null;
  send(res, 200, settingsPage({
    eshopName: installation.eshopName,
    eshopId,
    themeConfig: installation.themeConfig || DEFAULT_THEME_CONFIG,
    csrf: session.csrf,
    flash,
  }));
}

async function handleAuthCallback(req, res, url) {
  const state = url.searchParams.get('state');
  const pending = state && pendingStates.get(state);
  pendingStates.delete(state);
  if (!pending || pending.expiresAt < Date.now()) {
    return send(res, 400, messagePage('Ověření vypršelo', 'Otevřete nastavení doplňku znovu z administrace e-shopu.'));
  }

  const installation = getInstallation(pending.eshopId);
  const admin = await verifyAdmin(installation.oauthBase, {
    code: url.searchParams.get('code'),
    redirectUri: `${publicUrl(req)}/auth/callback`,
  });
  if (String(admin.project?.id) !== pending.eshopId) {
    return send(res, 403, messagePage('Přístup odepřen', 'Přihlášený účet nepatří k tomuto e-shopu.'));
  }

  const sessionId = token();
  sessions.set(sessionId, { eshopId: pending.eshopId, csrf: token(), expiresAt: Date.now() + SESSION_TTL });
  // SameSite=None: stránka nastavení se může otevírat v rámci administrace Shoptetu.
  redirect(res, `/settings?eshopId=${encodeURIComponent(pending.eshopId)}`, {
    'Set-Cookie': `asteroid_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${SESSION_TTL / 1000}`,
  });
}

async function handleSettingsPost(req, res, url) {
  const eshopId = url.searchParams.get('eshopId');
  const session = getSession(req, eshopId);
  const installation = session && getInstallation(eshopId);
  if (!installation) return send(res, 403, messagePage('Přístup odepřen', 'Otevřete nastavení znovu z administrace e-shopu.'));

  const form = await readForm(req);
  if (!safeEqual(form.get('csrf'), session.csrf)) {
    return send(res, 403, messagePage('Přístup odepřen', 'Neplatný formulář, načtěte stránku znovu.'));
  }

  const themeConfig = themeConfigFromForm(form);
  try {
    await setHeaderSnippet(installation, buildHeaderSnippet(themeConfig));
  } catch (error) {
    console.error(`uložení e-shopu ${eshopId}: ${error.message}`);
    return send(res, 502, settingsPage({
      eshopName: installation.eshopName,
      eshopId,
      themeConfig,
      csrf: session.csrf,
      flash: { type: 'err', message: `Nepodařilo se uložit do e-shopu: ${error.message}` },
    }));
  }

  saveInstallation(eshopId, { themeConfig });
  redirect(res, `/settings?eshopId=${encodeURIComponent(eshopId)}&saved=1`);
}

const routes = {
  'GET /install': handleInstall,
  'GET /settings': handleSettingsGet,
  'POST /settings': handleSettingsPost,
  'GET /auth/callback': handleAuthCallback,
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const handler = routes[`${req.method} ${url.pathname}`];
  if (!handler) return send(res, 404, 'Nenalezeno');

  try {
    await handler(req, res, url);
  } catch (error) {
    console.error(`${req.method} ${url.pathname}: ${error.message}`);
    if (!res.headersSent) send(res, 500, messagePage('Chyba', 'Něco se pokazilo, zkuste to prosím znovu.'));
  }
}).listen(config.port, () => {
  console.log(`settings-app běží na http://localhost:${config.port}`);
});
