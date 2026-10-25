// Settings-app doplňku aSteroid.
//
//   GET  /install?code=…              instalace doplňku (volá Shoptet ze svých serverů)
//   GET  /settings?eshopId=…&code=…   stránka nastavení v administraci Shoptetu (iframe, zjednodušené OAuth)
//   GET  /settings?eshopId=…&t=…      stránka nastavení s platnou relací (podepsaný token)
//   GET  /auth/callback               návrat z plného OAuth ověření admina (otevření mimo administraci)
//   POST /settings?eshopId=…          uložení nastavení a vložení kódu do e-shopu přes API
//   GET  /public/<eshopId>/category-articles.json   články ke kategoriím pro šablonu (veřejné)

import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { config } from './config.mjs';
import { getInstallation, saveInstallation } from './store.mjs';
import { exchangeInstallCode, setHeaderSnippet, getCategories, getArticles, adminAuthorizeUrl, verifyAdmin } from './shoptet.mjs';
import { finishInstall } from './install.mjs';
import { createSessionToken, verifySessionToken } from './session.mjs';
import { DEFAULT_THEME_CONFIG, themeConfigFromForm, buildHeaderSnippet, categoryChoices, snippetConfig } from './theme-config.mjs';
import {
  articleSummaries,
  articlesErrorMessage,
  categoryArticlesFromForm,
  publishedCategoryArticles,
} from './category-articles.mjs';
import { settingsPage, messagePage } from './views.mjs';

const STATE_TTL = 10 * 60 * 1000;
// Zveřejněné články ke kategoriím: prohlížeč drží soubor 5 minut, server data z API obnovuje
// nejdřív po 10 minutách (na pozadí, návštěvník dostane hned poslední platná data).
const ARTICLES_MAX_AGE = 300;
const ARTICLES_REFRESH = 10 * 60 * 1000;
const ARTICLES_RETRY = 60 * 1000;
const refreshing = new Map(); // eshopId → Promise obnovy
const lastRefresh = new Map(); // eshopId → čas posledního pokusu (při výpadku API nezkoušet každý požadavek)

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

// Články e-shopu z API. Úspěch obnoví i zveřejněná data (přejmenování, skrytí, smazání článku).
// Při chybě vrací poslední načtené články a zprávu pro admina, uložené přiřazení se nemění.
async function loadArticles(installation, eshopId) {
  try {
    const articles = articleSummaries(await getArticles(installation));
    saveInstallation(eshopId, {
      articlesCache: { items: articles, fetchedAt: new Date().toISOString() },
      categoryArticlesPublished: {
        data: publishedCategoryArticles(getInstallation(eshopId)?.categoryArticles, articles),
        builtAt: Date.now(),
      },
    });
    return { articles, error: null };
  } catch (error) {
    console.error(`články e-shopu ${eshopId}: ${error.message}`);
    return { articles: installation.articlesCache?.items || null, error: articlesErrorMessage(error) };
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
  const [categories, articles] = await Promise.all([
    loadCategories(installation, eshopId),
    loadArticles(installation, eshopId),
  ]);
  send(res, 200, settingsPage({
    eshopName: installation.eshopName,
    eshopId,
    eshopOrigin: new URL(installation.eshopUrl).origin,
    themeConfig: { ...DEFAULT_THEME_CONFIG, ...installation.themeConfig },
    categoryChoices: categories && categoryChoices(categories),
    categoryArticles: installation.categoryArticles || {},
    articles,
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
  // Bez načtených článků (chyba API) posílá stránka uložená přiřazení ve skrytých polích.
  const categoryArticles = categoryArticlesFromForm(form);
  // E-shop běží na HTTPS, soubor z jiné adresy (např. uložení přes localhost) by prohlížeč nenačetl.
  // Pak necháme dříve uloženou adresu.
  const ownUrl = `${publicUrl(req)}/public/${encodeURIComponent(eshopId)}/category-articles.json`;
  const categoryArticlesUrl = ownUrl.startsWith('https://') ? ownUrl : installation.categoryArticlesUrl || null;
  if (categoryArticlesUrl !== ownUrl) console.warn(`uložení: e-shop ${eshopId}, adresa ${ownUrl} není HTTPS, články zůstávají na ${categoryArticlesUrl}`);
  try {
    await setHeaderSnippet(installation, buildHeaderSnippet(snippetConfig({ themeConfig, categoryArticles, categoryArticlesUrl })));
  } catch (error) {
    console.error(`uložení e-shopu ${eshopId}: ${error.message}`);
    return send(res, 502, settingsPage({
      eshopName: installation.eshopName,
      eshopId,
      eshopOrigin: new URL(installation.eshopUrl).origin,
      themeConfig,
      categoryChoices: categories && categoryChoices(categories),
      categoryArticles,
      articles: { articles: installation.articlesCache?.items || null, error: null },
      token,
      lang,
      flash: { type: 'err', message: `Nepodařilo se uložit do e-shopu: ${error.message}` },
    }), { installation });
  }

  const articles = installation.articlesCache?.items;
  saveInstallation(eshopId, {
    themeConfig,
    categoryArticles,
    categoryArticlesUrl,
    // Hned zveřejnit z posledních načtených článků, server je pak obnovuje z API (handlePublicArticles).
    ...(articles ? { categoryArticlesPublished: { data: publishedCategoryArticles(categoryArticles, articles), builtAt: 0 } } : {}),
  });
  console.log(`uložení: e-shop ${eshopId}, hlavička ${themeConfig.header}, kategorií na úvodní stránce ${themeConfig.homeCategories.items.length}, vzhled kategorie ${themeConfig.categoryLayout}${themeConfig.categoryTint ? " (světlé pozadí)" : ""}`);
  redirect(res, settingsUrl(eshopId, { t: token, lang, saved: '1' }));
}

// Obnova zveřejněných článků z API, nejvýš jedna naráz pro e-shop. Chyba API nic nemaže.
function refreshPublishedArticles(eshopId) {
  if (refreshing.has(eshopId)) return refreshing.get(eshopId);
  lastRefresh.set(eshopId, Date.now());
  const job = loadArticles(getInstallation(eshopId), eshopId).finally(() => refreshing.delete(eshopId));
  refreshing.set(eshopId, job);
  return job;
}

// Veřejný soubor pro šablonu: { categories: { <GUID kategorie>: { title, articles: [{ title, url }] } } }.
// Čte ho prohlížeč návštěvníka z domény e-shopu (CORS), obsahuje jen zveřejněné články.
async function handlePublicArticles(req, res, url) {
  const eshopId = url.pathname.split('/')[2];
  const installation = /^\d+$/.test(eshopId) && getInstallation(eshopId);
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  if (!installation) {
    res.writeHead(404, { ...headers, 'Cache-Control': 'no-store' });
    return res.end('{"categories":{}}');
  }

  let published = installation.categoryArticlesPublished;
  if (!published && Date.now() - (lastRefresh.get(eshopId) || 0) > ARTICLES_RETRY) {
    await refreshPublishedArticles(eshopId);
    published = getInstallation(eshopId).categoryArticlesPublished;
  } else if (published && Date.now() - published.builtAt > ARTICLES_REFRESH && Date.now() - (lastRefresh.get(eshopId) || 0) > ARTICLES_RETRY) {
    refreshPublishedArticles(eshopId);
  }

  if (!published) {
    res.writeHead(503, { ...headers, 'Cache-Control': 'no-store', 'Retry-After': String(ARTICLES_RETRY / 1000) });
    return res.end('{"categories":{}}');
  }

  res.writeHead(200, {
    ...headers,
    'Cache-Control': `public, max-age=${ARTICLES_MAX_AGE}, stale-while-revalidate=86400, stale-if-error=86400`,
  });
  res.end(JSON.stringify(published?.data || { categories: {} }));
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
  const handler = /^\/public\/\d+\/category-articles\.json$/.test(url.pathname) && req.method === 'GET'
    ? handlePublicArticles
    : routes[`${req.method} ${url.pathname}`];
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
