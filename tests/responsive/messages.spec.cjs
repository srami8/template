// Hlášky jako toast (components/_messages.scss, Figma 1738:67): nejvýš 600 px dole na středu, čtyři
// typy s ikonou a křížkem, stejně s CSS Disca (kopie base-blank.css) i bez něj (Blank mode).
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
// BOM na začátku souboru by v <style> zneplatnil první blok (v odkazovaném souboru nevadí).
const read = (name) => fs.readFileSync(path.join(dist, name), 'utf8').replace(/^\uFEFF/, '').replace(/<\/style/gi, '%3C/style');
const msg = (type, text) => `<div class="msg msg-${type}" role="alert"><div class="container"><span>${text}</span></div></div>`;
const LONG = 'Dlouhá hláška na více řádků, která se musí zalomit uvnitř toastu a nesmí přetéct ven ani pod křížek. '.repeat(3);
const html = (css, body) => `<!doctype html><html class="as-theme" lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body><div class="messages">${body}</div><button id="under" style="position:fixed;top:20px;left:0;width:40px;height:40px">x</button></body></html>`;
const COLORS = { success: 'rgb(40, 133, 85)', error: 'rgb(197, 23, 23)', info: 'rgb(26, 82, 167)', warning: 'rgb(224, 105, 65)', notice: 'rgb(40, 133, 85)' };

const measure = (p) => p.locator('.msg').first().evaluate((el) => {
  const r = el.getBoundingClientRect();
  const span = el.querySelector('span').getBoundingClientRect();
  const before = getComputedStyle(el, '::before');
  const after = getComputedStyle(el, '::after');
  return {
    x: r.x, bottom: r.bottom, width: r.width, height: r.height, right: r.right, spanRight: span.right, radius: getComputedStyle(el).borderTopLeftRadius,
    color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor, border: getComputedStyle(el).borderTopWidth, padding: getComputedStyle(el).paddingLeft,
    icon: [before.width, before.maskImage], close: [after.width, after.maskImage],
  };
});

for (const [mode, files] of [['s CSS Disca', ['base-blank.css', 'asteroid.css']], ['bez CSS Disca', ['asteroid.css']]]) {
  const css = files.map(read).join('\n');

  test(`toast: 600 px dole na středu, typy, ikony a křížek (${mode})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const icons = new Set();
    for (const [type, bg] of Object.entries(COLORS)) {
      await page.setContent(html(css, msg(type, 'Zboží bylo vloženo do košíku')));
      const m = await measure(page);
      expect(m.width).toBe(600);
      expect(m.x).toBe(420);
      expect(m.bottom).toBe(880);
      expect(m.height).toBe(60);
      expect(m.padding).toBe('20px');
      expect(m.border).toBe('0px');
      expect(m.radius).toBe('4px');
      expect(m.bg).toBe(bg);
      expect(m.color).toBe('rgb(255, 255, 255)');
      expect(m.icon[0]).toBe('20px');
      expect(m.close[0]).toBe('12px');
      expect(m.icon[1]).toContain('url(');
      expect(m.close[1]).toContain('url(');
      if (type !== 'notice') icons.add(m.icon[1]);
    }
    expect(icons.size).toBe(4);
  });

  test(`toast na telefonu a dlouhý text se zalomí uvnitř (${mode})`, async ({ page }) => {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 800 });
      // Včetně dlouhého e-mailu bez mezer, ten nesmí přetéct pod křížek ani ven z toastu.
      await page.setContent(html(css, msg('error', `${LONG}jan.novak.velmi.dlouhe.prijmeni.firma@priklad-dlouha-domena-spolecnosti.example.invalid <a href="#">odkaz</a>`)));
      const m = await measure(page);
      expect(m.x).toBe(16);
      expect(m.bottom).toBe(780);
      expect(m.width).toBe(width - 32);
      expect(m.height).toBeGreaterThan(60);
      expect(m.spanRight).toBeLessThanOrEqual(m.right - 20 - 12);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      const link = await page.locator('.msg a').evaluate((a) => [getComputedStyle(a).color, getComputedStyle(a).textDecorationLine]);
      expect(link).toEqual(['rgb(255, 255, 255)', 'underline']);
    }
  });

  test(`toast neblokuje stránku vedle sebe a zavíraná hláška zmizí (${mode})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.setContent(html(css, msg('info', 'Doprava zdarma od 1 000 Kč')));
    expect(await page.evaluate(() => document.elementFromPoint(20, 40).id)).toBe('under');
    expect(await page.evaluate(() => !!document.elementFromPoint(720, 850).closest('.msg'))).toBe(true);
    await page.locator('.msg').evaluate((el) => el.classList.add('hidden'));
    expect(await page.locator('.msg').evaluate((el) => getComputedStyle(el).display)).toBe('none');
  });
}
