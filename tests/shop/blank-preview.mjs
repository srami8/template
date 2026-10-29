// Lokální náhled skutečného HTML: port 8792 původní CSS, 8793 Blank mode: CSS Shoptetu (vzhled Disca
// a písmo ikon) vypnuté, jen styly aSteroidu. Ukazuje, co aSteroid ještě sám nepokrývá.
// Zachovává JS Shoptetu, font z administrace a ostatní doplňky. Nastavení e-shopu nemění.
// Veřejné GET/HEAD a prázdný nativní POST pro dočtení produktů dvou testovacích kategorií.
// Objednávku, košík ani jiné formuláře proxy neodešle.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { styleFiles } from '../../theme/src/js/styles.mjs';

const SHOP = 'https://313980.myshoptet.com';
const dist = new URL('../../theme/dist/', import.meta.url);
const nativeStyle = /\/shop\/dist\/(?:main-\d+\.less|font-shoptet-\d+\.css)[^/]*\.css(?:\?.*)?$/;

function localLinks(html) {
  return html.replace(/(data-url|href)=(["'])https:\/\/313980\.myshoptet\.com\//g, '$1=$2/')
    // makeFilterAjaxRequest bere novou adresu z posledního drobečku. Cizí origin
    // by zablokoval pushState a další změna ceny by vrátila už zrušené filtry.
    .replace(/(<meta\b(?=[^>]*\bitemprop=["']item["'])[^>]*\bcontent=["'])https:\/\/313980\.myshoptet\.com\//g, '$1/');
}

export function rewriteHtml(html, blank) {
  const match = html.match(/window\.asteroidConfig\s*=\s*(\{[^\n]*\});/);
  // Nativní AJAX může vrátit jen HTML fragment, který nemá hlavičku s konfigurací.
  if (!match) return localLinks(html);
  const config = JSON.parse(match[1]);
  let result = html.replace(match[0], `window.asteroidConfig = ${JSON.stringify(config).replace(/</g, '\\u003c')};`);
  result = result.replace(/<link\b[^>]*>/gi, (tag) => {
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (/data-as-style=/.test(tag)) return '';
    if (blank && href && nativeStyle.test(new URL(href, SHOP).pathname)) return '';
    return tag;
  });
  const styles = styleFiles(config).map((name) => `<link rel="stylesheet" href="/__as/${name}.css" data-as-style="${name}">`).join('\n');
  result = result.replace(/<script\b[^>]*src=["'][^"']*\/asteroid\.js[^"']*["'][^>]*><\/script>/,
    `${styles}\n<script src="/__as/asteroid.js"></script>`);
  // Nativní řazení používá data-url i pro AJAX a history.pushState. V náhledu zůstane na proxy.
  return localLinks(result);
}

export function startPreview(port, blank) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const readMore = req.method === 'POST'
        && /^\/(pletene-kosiky|sperky)\/(?:strana-\d+\/)?$/.test(url.pathname)
        && req.headers['x-shoptet-xhr'] === 'Shoptet_Coo7ai';
      if ((!['GET', 'HEAD'].includes(req.method) && !readMore) || /^\/admin(?:\/|$)/.test(url.pathname)) {
        res.writeHead(405); return res.end('Náhled podporuje jen veřejné čtení.');
      }
      if (url.pathname.startsWith('/__as/')) {
        const name = basename(url.pathname);
        if (!/^[a-z0-9.-]+\.(css|js|woff2?)$/.test(name)) { res.writeHead(404); return res.end(); }
        const body = readFileSync(new URL(name, dist));
        const types = { css: 'text/css', js: 'text/javascript', woff: 'font/woff', woff2: 'font/woff2' };
        res.writeHead(200, { 'Content-Type': types[name.split('.').pop()], 'Cache-Control': 'no-store' });
        return res.end(body);
      }
      if (readMore) {
        // Načtení dalších produktů neposílá formulářová data. Jiný POST zůstává zakázaný.
        for await (const chunk of req) {
          if (chunk.length) { res.writeHead(405); return res.end('Formuláře nejsou v náhledu povolené.'); }
        }
      }
      const target = new URL(url.pathname + url.search, SHOP);
      const headers = { 'User-Agent': req.headers['user-agent'] || 'aSteroid local preview' };
      if (req.headers.cookie) headers.Cookie = req.headers.cookie;
      if (req.headers['x-requested-with']) headers['X-Requested-With'] = req.headers['x-requested-with'];
      if (req.headers['x-shoptet-xhr']) headers['X-Shoptet-XHR'] = req.headers['x-shoptet-xhr'];
      const upstream = await fetch(target, { method: req.method, headers, redirect: 'manual' });
      if (upstream.headers.has('location')) {
        const next = new URL(upstream.headers.get('location'), SHOP);
        res.writeHead(upstream.status, { Location: next.origin === SHOP ? next.pathname + next.search : next.href });
        return res.end();
      }
      const type = upstream.headers.get('content-type') || 'application/octet-stream';
      const responseHeaders = { 'Content-Type': type, 'Cache-Control': 'no-store' };
      if (upstream.headers.getSetCookie) {
        responseHeaders['Set-Cookie'] = upstream.headers.getSetCookie().map((value) => value.replace(/;\s*Domain=[^;]+/gi, ''));
      }
      const body = type.includes('text/html') ? rewriteHtml(await upstream.text(), blank) : Buffer.from(await upstream.arrayBuffer());
      res.writeHead(upstream.status, responseHeaders);
      res.end(body);
    } catch (error) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end(`Náhled: ${error.message}`);
    }
  });
  return server.listen(port, '127.0.0.1', () => console.log(`Náhled ${blank ? 'Blank CSS' : 'Disco'}: http://127.0.0.1:${port}`));
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  startPreview(8792, false);
  startPreview(8793, true);
}
