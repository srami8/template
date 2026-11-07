// Sestaví stránku styleguidu (index.html) a přehled pro repozitář (styleguide.md) ze seznamu komponent a snímků.
const fs = require('fs'); const path = require('path');
const { components } = require('./manifest.cjs');
// Stránka styleguidu: test-results/styleguide/index.html, přehled: docs/komponenty-stav.md.
const ROOT = path.resolve(__dirname, '../../..');
const dir = path.join(ROOT, 'test-results/styleguide'); const img = path.join(dir, 'img');
fs.mkdirSync(img, { recursive: true });
// Výsledky všech běhů focení (results*.json); novější běh přepíše starší údaje stejného snímku.
const results = Object.assign({}, ...fs.readdirSync(img).filter((f) => /^results.*\.json$/.test(f)).sort((a, b) => fs.statSync(path.join(img, a)).mtimeMs - fs.statSync(path.join(img, b)).mtimeMs).map((f) => JSON.parse(fs.readFileSync(path.join(img, f), 'utf8'))));
const blankDiff = (() => { try { return JSON.parse(fs.readFileSync(path.join(img, 'blank-diff.json'), 'utf8')); } catch { return {}; } })();
// Bez CSS Disca: horší výsledek z počítače a telefonu.
const BLANK = { ok: ['Funguje', 'rozdíl do 0,5 % plochy'], drobne: ['Drobné rozdíly', 'do 5 % plochy, nebo změřen jen začátek dlouhé stránky'], rozbite: ['Rozpadá se', 'chybí styly Disca'], chybi: ['Neměřeno', 'nejde nafotit'] };
// Neměřené zařízení nesmí skončit jako „Funguje“, proto je chybi před ok.
const ORDER = ['rozbite', 'drobne', 'chybi', 'ok'];
const blankOf = (c) => { const v = ['d', 'm'].map((vp) => blankDiff[`${vp}-${c.id}`]).filter(Boolean); if (!v.length) return { verdict: 'chybi' }; return v.sort((a, b) => ORDER.indexOf(a.verdict) - ORDER.indexOf(b.verdict))[0]; };
const blankCount = (k) => components.filter((c) => blankOf(c).verdict === k).length;
const has = (k) => fs.existsSync(path.join(img, `${k}.jpg`)) && results[k] && !results[k].err;
const STATUS = {
  hotovo: ['Hotovo', 'návrh i kód'], castecne: ['Částečně', 'jen některé části'], 'navrh-bez-kodu': ['Návrh bez kódu', 'čeká na kód'],
  'kod-bez-navrhu': ['Kód bez návrhu', 'globální komponenty, chybí návrh'], chybi: ['Chybí', 'jen vzhled Disca'],
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const groups = [...new Set(components.map((c) => c.group))];
const count = (s) => components.filter((c) => c.status === s).length;
const figure = (mode, vp, c) => { const k = `${mode}-${vp}-${c.id}`; const label = { disco: 'Disco', asteroid: 'aSteroid', blank: 'aSteroid bez CSS Disca' }[mode]; return `<figure class="shot ${mode}"><figcaption>${label}${results[k]?.cut ? ' · oříznuto' : ''}</figcaption>${has(k) ? `<a href="img/${k}.jpg" target="_blank" rel="noopener" title="Otevřít ve skutečné velikosti"><img src="img/${k}.jpg" alt="${esc(c.name)} – ${label}" loading="lazy"></a>` : '<div class="none">Na testovacím e-shopu nejde nafotit</div>'}</figure>`; };
const blankPill = (c) => { const b = blankOf(c); return `<span class="pill b-${b.verdict}" title="Bez CSS Disca: ${BLANK[b.verdict][1]}">Bez CSS Disca: ${BLANK[b.verdict][0]}${b.share !== undefined && b.verdict !== 'ok' ? ` · ${String(b.share).replace('.', ',')} %` : ''}</span>`; };
const card = (c) => `<article class="comp" id="${c.id}" data-status="${c.status}" data-blank="${blankOf(c).verdict}">
<header><h3>${esc(c.name)}</h3><span class="pills"><span class="pill s-${c.status}">${STATUS[c.status][0]}</span>${blankPill(c)}</span></header>
<dl><div><dt>Figma</dt><dd>${esc(c.figma)}</dd></div><div><dt>Kód</dt><dd><code>${esc(c.scss)}</code></dd></div><div><dt>Třídy Shoptetu</dt><dd><code>${esc(c.disco)}</code></dd></div><div><dt>Navrhnout</dt><dd>${esc(c.states)}</dd></div><div><dt>Rám ve Figmě</dt><dd><code>${esc(`${c.group} / ${c.name}`)}</code></dd></div></dl>
${c.page ? `<div class="pair"><span class="vp">Počítač 1440 px</span>${figure('disco', 'd', c)}${figure('asteroid', 'd', c)}${figure('blank', 'd', c)}</div>${c.m ? `<div class="pair mobile"><span class="vp">Telefon 390 px</span>${figure('disco', 'm', c)}${figure('asteroid', 'm', c)}${figure('blank', 'm', c)}</div>` : ''}` : '<p class="note">Stránka se objeví až po objednávce, přihlášení nebo akci zákazníka, proto bez snímku. Podklad je markup Shoptetu uvedený výše.</p>'}
</article>`;
const html = `<title>Komponenty aSteroid</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
<style>
/* Referenční katalog: přehled stavů nahoře, pak komponenty po skupinách, Disco vlevo a aSteroid vpravo. */
:root{--bg:#f6f7f9;--panel:#ffffff;--fg:#1d2330;--muted:#5d6575;--line:#dfe3ea;--accent:#1f6fd1;
--ok:#1f7a45;--ok-bg:#e3f3e9;--part:#8a5a00;--part-bg:#fbefd6;--design:#1f5fb8;--design-bg:#e2edfb;--code:#6b3fa0;--code-bg:#efe6fa;--miss:#b3261e;--miss-bg:#fbe5e3;
--sans:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#13161c;--panel:#1b1f27;--fg:#e7eaf0;--muted:#a3abb9;--line:#2c323d;--accent:#6aa5f0;
--ok:#7fd3a0;--ok-bg:#183326;--part:#f0c26b;--part-bg:#3a2d12;--design:#8fb8f2;--design-bg:#182a44;--code:#c7a6ef;--code-bg:#2b2140;--miss:#f19c95;--miss-bg:#3d1c1a;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#13161c;--panel:#1b1f27;--fg:#e7eaf0;--muted:#a3abb9;--line:#2c323d;--accent:#6aa5f0;
--ok:#7fd3a0;--ok-bg:#183326;--part:#f0c26b;--part-bg:#3a2d12;--design:#8fb8f2;--design-bg:#182a44;--code:#c7a6ef;--code-bg:#2b2140;--miss:#f19c95;--miss-bg:#3d1c1a;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:15px/1.55 var(--sans)}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:32px 64px}
h1{font-size:28px;font-weight:600;margin:0 0 6px;text-wrap:balance}h2{font-size:20px;font-weight:600;margin:40px 0 12px;text-wrap:balance}h3{font-size:16px;font-weight:600;margin:0}
.lead{color:var(--muted);max-width:70ch;margin:0 0 20px}
code{font:12.5px/1.5 var(--mono);overflow-wrap:anywhere}
.summary{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}
.filter{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--panel);color:var(--fg);border-radius:999px;padding:6px 14px;font:500 14px var(--sans);cursor:pointer}
.filter b{font-variant-numeric:tabular-nums}.filter[aria-pressed="true"]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.filter:focus-visible,.toc a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pill{font:500 12px/1 var(--sans);padding:6px 10px;border-radius:999px;white-space:nowrap}
.b-ok{color:var(--ok);background:var(--ok-bg)}.b-drobne{color:var(--part);background:var(--part-bg)}.b-rozbite{color:var(--miss);background:var(--miss-bg)}.b-chybi{color:var(--muted);background:var(--bg);border:1px solid var(--line)}
.pills{display:flex;flex-wrap:wrap;gap:6px}
.s-hotovo{color:var(--ok);background:var(--ok-bg)}.s-castecne{color:var(--part);background:var(--part-bg)}.s-navrh-bez-kodu{color:var(--design);background:var(--design-bg)}.s-kod-bez-navrhu{color:var(--code);background:var(--code-bg)}.s-chybi{color:var(--miss);background:var(--miss-bg)}
.toc{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 8px;font-size:14px}.toc a{color:var(--accent);text-decoration:none}
.howto{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin:24px 0 8px}
.howto ol{margin:8px 0 0;padding-left:20px;display:grid;gap:6px;max-width:80ch}
.comp{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin:0 0 16px;display:grid;gap:14px;min-width:0}
.comp>header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px 24px;margin:0}
dl div{min-width:0}dt{font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}dd{margin:2px 0 0;font-size:14px}
.pair{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:start}
.pair .vp{grid-column:1/-1;font-size:12px;color:var(--muted)}
.pair.mobile{grid-template-columns:repeat(3,minmax(0,260px))}
.shot{margin:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff;min-width:0}
.shot figcaption{font:500 12px var(--sans);padding:6px 10px;border-bottom:1px solid var(--line);background:var(--panel);color:var(--muted)}
.shot.asteroid figcaption{color:var(--accent)}.shot.blank figcaption{color:var(--miss)}
.shot img{display:block;width:100%;height:auto}
.none{padding:24px 12px;font-size:13px;color:var(--muted);background:var(--panel)}
.note{margin:0;font-size:14px;color:var(--muted)}
.comp[hidden]{display:none}
@media (max-width:900px){.pair,.pair.mobile{grid-template-columns:minmax(0,1fr)}}
.summary-label{font-size:12px;color:var(--muted);align-self:center;min-width:110px}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
</style>
<div class="wrap">
<h1>Komponenty aSteroid</h1>
<p class="lead">Všechny komponenty, které Shoptet nad šablonou Disco vykresluje: původní Disco, aSteroid a aSteroid s vypnutým CSS Shoptetu (Blank mode) na testovacím e-shopu 313980 (snímky ${new Date().toLocaleDateString('cs-CZ')}). Barvy jsou z administrace testovacího e-shopu. Filtrem zobrazíte jen komponenty v daném stavu.</p>
<div class="summary" role="group" aria-label="Filtr podle stavu"><span class="summary-label">Návrh a kód</span><button class="filter" type="button" data-f="all" aria-pressed="true">Vše <b>${components.length}</b></button>${Object.entries(STATUS).map(([k, [n, d]]) => `<button class="filter" type="button" data-f="${k}" data-kind="status" aria-pressed="false" title="${d}"><span class="pill s-${k}">${n}</span><b>${count(k)}</b></button>`).join('')}</div>
<div class="summary" role="group" aria-label="Filtr podle Blank mode"><span class="summary-label">Bez CSS Disca</span>${Object.entries(BLANK).map(([k, [n, d]]) => `<button class="filter" type="button" data-f="${k}" data-kind="blank" aria-pressed="false" title="${d}"><span class="pill b-${k}">${n}</span><b>${blankCount(k)}</b></button>`).join('')}</div>
<nav class="toc" aria-label="Skupiny">${groups.map((g) => `<a href="#g-${g.replace(/[^a-z]/gi, '')}">${esc(g)}</a>`).join('')}</nav>
<section class="howto"><h2 style="margin-top:0">Jak to připravit ve Figmě</h2><ol>
<li>Pro každou komponentu jeden rám pojmenovaný podle řádku „Rám ve Figmě“ (např. <code>Základ / Hlášky (úspěch, chyba, info, varování)</code>), varianty a stavy jako komponenta s vlastnostmi <code>Typ</code>, <code>Velikost</code>, <code>Stav</code>.</li>
<li>Vždy počítač i telefon; stavy z řádku „Navrhnout“ vedle sebe.</li>
<li>Barvy jen z proměnných (hlavní, konverzní a jejich hover, neutrální šedé), text na barvě obchodníka podle kontrastu.</li>
<li>Vycházet z tříd Shoptetu v řádku „Třídy Shoptetu“: šablona přebírá jeho markup, nový prvek označit poznámkou.</li>
<li>Hotovou komponentu poslat odkazem na rám; k implementaci stačí odkaz a název z tohoto přehledu.</li></ol></section>
${groups.map((g) => `<h2 id="g-${g.replace(/[^a-z]/gi, '')}">${esc(g)}</h2>${components.filter((c) => c.group === g).map(card).join('\n')}`).join('\n')}
</div>
<script>
const buttons=[...document.querySelectorAll('.filter')],cards=[...document.querySelectorAll('.comp')];
function apply(f,kind){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.f===f&&(b.dataset.kind||'')===(kind||''))));cards.forEach(c=>{c.hidden=f!=='all'&&(kind==='blank'?c.dataset.blank:c.dataset.status)!==f;});try{localStorage.setItem('as-sg-filter',JSON.stringify([f,kind||'']));}catch(e){}}
buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.f,b.dataset.kind)));
try{const [f,kind]=JSON.parse(localStorage.getItem('as-sg-filter')||'[]');if(f&&buttons.some(b=>b.dataset.f===f&&(b.dataset.kind||'')===kind))apply(f,kind);}catch(e){}
</script>`;
fs.writeFileSync(path.join(dir, 'index.html'), html);
// Svislítko v buňce tabulky Markdownu musí být escapované.
const cell = (v) => String(v).replace(/\|/g, '\\|');
const md = `# Komponenty Disco × aSteroid\n\nPřehled stavu komponent; vizuální srovnání: [styleguide Disco × aSteroid](https://claude.ai/artifact/2peuukfUKNGyeUzgfLMKrP). „Bez CSS Disca“ = stav s vypnutým CSS Shoptetu jen se styly aSteroidu, viz [blank-mode.md](blank-mode.md) (vygenerováno ${new Date().toLocaleDateString('cs-CZ')}; snímky a stránka styleguidu: \`npm run styleguide\`). Stavy: hotovo = návrh i kód, částečně, návrh bez kódu, kód bez návrhu (jen globální komponenty), chybí (vzhled Disca).\n\n| Skupina | Komponenta | Stav | Bez CSS Disca | Figma | Kód | Třídy Shoptetu | Navrhnout |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${components.map((c) => `| ${c.group} | ${c.name} | ${STATUS[c.status][0]} | ${BLANK[blankOf(c).verdict][0]}${blankOf(c).share !== undefined && blankOf(c).verdict !== 'ok' ? ` (${String(blankOf(c).share).replace('.', ',')} %)` : ''} | ${cell(c.figma)} | \`${cell(c.scss)}\` | \`${cell(c.disco)}\` | ${cell(c.states)} |`).join('\n')}\n`;
fs.writeFileSync(path.join(ROOT, 'docs/komponenty-stav.md'), md);
const used = fs.readdirSync(img).filter((f) => f.endsWith('.jpg'));
console.log('komponent', components.length, 'snímků', used.length, 'velikost', Math.round(used.reduce((s, f) => s + fs.statSync(path.join(img, f)).size, 0) / 1024), 'kB');
