// Pás bannerů na telefonu (Figma 1739:7153) nad skutečným markupem Shoptetu: s CSS Disca (kopie
// base-blank.css) i bez něj (Blank mode). Banner s odkazem a texty, banner s prázdnými texty, banner bez odkazu.
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
// BOM na začátku souboru by v <style> zneplatnil první blok (v odkazovaném souboru nevadí).
const read = (name) => fs.readFileSync(path.join(dist, name), 'utf8').replace(/^﻿/, '').replace(/<\/style/gi, '%3C/style');
const svg = (w, h) => `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"%3E%3Crect width="${w}" height="${h}" fill="%2378c5f1"/%3E%3C/svg%3E`;
const image = (w, h) => `<img src='${svg(w, h)}' width="${w}" height="${h}" alt="">`;
const html = (css, variant) => `<!doctype html><html class="as-theme as-banners-${variant}" lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body class="type-index"><div id="content-wrapper" class="container content-wrapper"><div class="content-wrapper-in"><main id="content" class="content wide"><div class="row banners-row"><div class="wide-carousel"><div id="carousel" class="carousel slide" data-ride="carousel">
<div class="carousel-inner" role="listbox">
<div class="item active"><a href="/a">${image(720, 720)}<span class="extended-banner-texts"><span class="extended-banner-title">Poznávejte svět z dronu</span><span class="extended-banner-text">Kochejte se pohledem z ptačí perspektivy</span><span class="extended-banner-link">Prohlédnout nabídku</span></span></a></div>
<div class="item"><a href="/b">${image(1880, 1000)}<span class="extended-banner-texts"></span></a></div>
<div class="item">${image(2048, 2048)}</div>
</div>
<a class="left carousel-control" href="#carousel" role="button" data-slide="prev"><span class="sr-only">Předchozí</span></a>
<a class="right carousel-control" href="#carousel" role="button" data-slide="next"><span class="sr-only">Další</span></a>
</div></div></div></main></div></div></body></html>`;

for (const [mode, files] of [['s CSS Disca', ['base-blank.css', 'asteroid.css']], ['bez CSS Disca', ['asteroid.css']]]) {
  const variants = fs.readdirSync(dist).filter((f) => /^banners-.*\.css$/.test(f)).map(read).join('\n');
  const css = `${files.map(read).join('\n')}\n${variants}`;

  for (const variant of ['default', 'content', 'fullwidth', 'cards']) {
    test(`pás bannerů na telefonu: ${variant} (${mode})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.setContent(html(css, variant));
      const m = await page.evaluate(() => {
        const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, width: r.width, height: r.height, bottom: r.bottom, y: r.y }; };
        const items = [...document.querySelectorAll('#carousel .carousel-inner > .item')];
        const first = items[0];
        const texts = first.querySelector('.extended-banner-texts');
        const title = first.querySelector('.extended-banner-title');
        const link = first.querySelector('.extended-banner-link');
        const images = items.map((item) => { const i = box(item.querySelector('img')); const c = box(item); return [i.x - c.x, i.y - c.y, i.width, i.height, getComputedStyle(item.querySelector('img')).objectFit]; });
        const cs = getComputedStyle(link);
        return {
          items: items.map(box), images,
          texts: box(texts), title: box(title), link: box(link),
          linkBg: cs.backgroundColor, linkRadius: cs.borderTopLeftRadius, linkPointer: cs.pointerEvents,
          titleColor: getComputedStyle(title).color,
          textsPointer: getComputedStyle(texts).pointerEvents,
          overflow: document.documentElement.scrollWidth,
          snap: getComputedStyle(first.parentElement).scrollSnapType,
        };
      });
      expect(m.items[0]).toMatchObject({ x: 16, width: 320, height: 375 });
      expect(m.items[1]).toMatchObject({ x: 352, width: 320, height: 375 });
      expect(m.items[2]).toMatchObject({ x: 688, width: 320, height: 375 });
      for (const image of m.images) expect(image).toEqual([0, 0, 320, 375, 'cover']);
      expect(m.texts).toMatchObject({ x: 16, width: 320, height: 375 });
      expect(m.title.y - m.items[0].y).toBe(32);
      expect(m.items[0].bottom - m.link.bottom).toBe(32);
      expect(m.link.height).toBe(44);
      expect(Math.abs(m.link.x + m.link.width / 2 - (16 + 160))).toBeLessThan(1);
      expect(m.linkBg).toBe('rgb(255, 255, 255)');
      expect(m.linkRadius).not.toBe('0px');
      expect(m.titleColor).toBe('rgb(255, 255, 255)');
      expect(m.textsPointer).toBe('none');
      expect(m.linkPointer).toBe('auto');
      expect(m.snap).toContain('mandatory');
      expect(m.overflow).toBe(390);
    });
  }
}
