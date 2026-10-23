// Settings-app doplňku aSteroid.
//
//   GET  /install?code=…              instalace doplňku (volá Shoptet ze svých serverů)
//   GET  /settings?eshopId=…&code=…   stránka nastavení v administraci Shoptetu (iframe, zjednodušené OAuth)
//   GET  /settings?eshopId=…&t=…      stránka nastavení s platnou relací (podepsaný token)
//   GET  /auth/callback               návrat z plného OAuth ověření admina (otevření mimo administraci)
//   POST /settings?eshopId=…          uložení nastavení a vložení kódu do e-shopu přes API

import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { config } from './config.mjs';
import { getInstallation, saveInstallation } from './store.mjs';
import { exchangeInstallCode, setHeaderSnippet, getCategories, adminAuthorizeUrl, verifyAdmin } from './shoptet.mjs';
import { finishInstall } from './install.mjs';
import { createSessionToken, verifySessionToken } from './session.mjs';
import { DEFAULT_THEME_CONFIG, themeConfigFromForm, buildHeaderSnippet, categoryChoices } from './theme-config.mjs';
import { settingsPage, messagePage } from './views.mjs';

const STATE_TTL = 10 * 60 * 1000;

// Rozpracovaná plná OAuth ověření (jen pro otevření mimo administraci). Po restartu stačí začít znovu.
const pendingStates = new Map(); // state → { eshopId, expiresAt }

function publicUrl(req) {
  if (config.publicUrl) return config.publicUrl.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${req.headers.host}`;
}

// Musí odpovídat poli „URL pro autorizaci uživatele“ v nastavení doplňku.
function authRedirectUri(req) {
  return `${publicUrl(req)}/auth/callback`;
}

// Stránku smí vložit jen administrace Shoptetu (e-shop může mít i vlastní doménu).
function frameAncestors(installation) {
  const sources = ["'self'", 'https://*.myshoptet.com'];
  if (installation?.eshopUrl) sources.push(new URL(installation.eshopUrl).origin);
  return sources.join(' ');
}

function send(res, status, body, { installation, headers = {} } = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    // Token relace je v adrese, nesmí odejít v Refereru na CDN se styly.
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': `frame-ancestors ${frameAncestors(installation)}`,
    ...headers,
  });
  res.end(body);
}

// Shoptet doporučuje pro stránky v administraci relativní Location.
function redirect(res, location) {
  res.writeHead(302, { Location: location, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  res.end();
}

function settingsUrl(eshopId, params = {}) {
  return `/settings?${new URLSearchParams({ eshopId: String(eshopId), ...params })}`;
}

// Kategorie e-shopu pro výběr na úvodní stránku. Chyba API nesmí zablokovat zbytek nastavení.
async function loadCategories(installation, eshopId) {
  try {
    return await getCategories(installation);
  } catch (error) {
    console.error(`kategorie e-shopu ${eshopId}: ${error.message}`);
    return null;
  }
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
  saveInstallation(result.eshopId, {
    oauthToken: result.access_token,
    eshopUrl: result.eshopUrl,
    installedAt: new Date().toISOString(),
  });
  send(res, 200, 'OK');
  console.log(`instalace: e-shop ${result.eshopId} (${result.eshopUrl})`);

  finishInstall(result.eshopId).catch((error) =>
    console.error(`instalace e-shopu ${result.eshopId}: ${error.message}`),
  );
}

// Ověří admina z OAuth kódu a vrátí token relace, nebo null, když účet k e-shopu nepatří.
async function sessionFromCode(req, installation, eshopId, code) {
  const admin = await verifyAdmin(installation.oauthBase, { code, redirectUri: authRedirectUri(req) });
  if (String(admin.project?.id) !== String(eshopId)) return null;
  return createSessionToken(eshopId);
}

async function handleSettingsGet(req, res, url) {
  const eshopId = url.searchParams.get('eshopId');
  const installation = eshopId && getInstallation(eshopId);
  if (!installation) {
    return send(res, 404, messagePage('Doplněk není nainstalovaný', 'Pro tento e-shop nemáme instalaci doplňku aSteroid.'));
  }
  const lang = url.searchParams.get('lang') || 'cs';

  // Administrace Shoptetu otevírá stránku rovnou s OAuth kódem (zástupný znak #OAUTH_CODE#).
  const code = url.searchParams.get('code');
  if (code) {
    const token = await sessionFromCode(req, installation, eshopId, code);
    if (!token) {
      return send(res, 403, messagePage('Přístup odepřen', 'Přihlášený účet nepatří k tomuto e-shopu.'), { installation });
    }
    return redirect(res, settingsUrl(eshopId, { t: token, lang }));
  }

  const token = url.searchParams.get('t');
  if (!verifySessionToken(token, eshopId)) {
    // Mimo administraci (nebo po vypršení relace) projdeme plným OAuth ověřením.
    const state = randomBytes(24).toString('base64url');
    pendingStates.set(state, { eshopId: String(eshopId), lang, expiresAt: Date.now() + STATE_TTL });
    return redirect(res, adminAuthorizeUrl(installation.oauthBase, { state, redirectUri: authRedirectUri(req) }));
  }

  const flash = url.searchParams.get('saved') === '1' ? { type: 'ok', message: 'Uloženo, e-shop už používá nové nastavení.' } : null;
  const categories = await loadCategories(installation, eshopId);
  send(res, 200, settingsPage({
    eshopName: installation.eshopName,
    eshopId,
    eshopOrigin: new URL(installation.eshopUrl).origin,
    themeConfig: { ...DEFAULT_THEME_CONFIG, ...installation.themeConfig },
    categoryChoices: categories && categoryChoices(categories),
    token,
    lang,
    flash,
  }), { installation });
}

async function handleAuthCallback(req, res, url) {
  const state = url.searchParams.get('state');
  const pending = state && pendingStates.get(state);
  pendingStates.delete(state);
  if (!pending || pending.expiresAt < Date.now()) {
    return send(res, 400, messagePage('Ověření vypršelo', 'Otevřete nastavení doplňku znovu z administrace e-shopu.'));
  }

  const installation = getInstallation(pending.eshopId);
  const token = await sessionFromCode(req, installation, pending.eshopId, url.searchParams.get('code'));
  if (!token) {
    return send(res, 403, messagePage('Přístup odepřen', 'Přihlášený účet nepatří k tomuto e-shopu.'), { installation });
  }
  redirect(res, settingsUrl(pending.eshopId, { t: token, lang: pending.lang }));
}

async function handleSettingsPost(req, res, url) {
  const eshopId = url.searchParams.get('eshopId');
  const installation = eshopId && getInstallation(eshopId);
  const form = await readForm(req);
  const token = form.get('t');
  if (!installation || !verifySessionToken(token, eshopId)) {
    return send(res, 403, messagePage('Relace vypršela', 'Otevřete nastavení doplňku znovu z administrace e-shopu.'), { installation });
  }
  const lang = form.get('lang') || 'cs';

  const categories = await loadCategories(installation, eshopId);
  const themeConfig = themeConfigFromForm(form, { categories, previous: installation.themeConfig });
  try {
    await setHeaderSnippet(installation, buildHeaderSnippet(themeConfig));
  } catch (error) {
    console.error(`uložení e-shopu ${eshopId}: ${error.message}`);
    return send(res, 502, settingsPage({
      eshopName: installation.eshopName,
      eshopId,
      eshopOrigin: new URL(installation.eshopUrl).origin,
      themeConfig,
      categoryChoices: categories && categoryChoices(categories),
      token,
      lang,
      flash: { type: 'err', message: `Nepodařilo se uložit do e-shopu: ${error.message}` },
    }), { installation });
  }

  saveInstallation(eshopId, { themeConfig });
  console.log(`uložení: e-shop ${eshopId}, hlavička ${themeConfig.header}, kategorií na úvodní stránce ${themeConfig.homeCategories.items.length}`);
  redirect(res, settingsUrl(eshopId, { t: token, lang, saved: '1' }));
}

// Kořen adresy: bez ID e-shopu nevíme, čí nastavení otevřít, tak jen poradíme, kudy dál.
async function handleRoot(req, res) {
  send(res, 200, messagePage(
    'Nastavení se otevírá z administrace',
    'Otevřete administraci svého e-shopu a v části Propojení → aSteroid (nebo ve Správci doplňků) klikněte na nastavení doplňku.',
    { type: 'info' },
  ));
}

const routes = {
  'GET /': handleRoot,
  'GET /install': handleInstall,
  'GET /settings': handleSettingsGet,
  'POST /settings': handleSettingsPost,
  'GET /auth/callback': handleAuthCallback,
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  // Jen názvy parametrů, hodnoty (code, state) jsou citlivé.
  console.log(`${req.method} ${url.pathname} [${[...url.searchParams.keys()].join(',')}]`);
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
