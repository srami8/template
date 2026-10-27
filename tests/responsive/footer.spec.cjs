// Skutečná patička Disca; nativní odeslání newsletteru se zde nesimuluje.
const fs = require('node:fs');
const path = require('node:path');
const {test, expect} = require('@playwright/test');
const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
const css = ['base-blank.css', 'asteroid.css'].map(n => fs.readFileSync(path.join(dist, n), 'utf8').replace(/<\/style/gi, '%3C/style')).join('\n');
const footer = fs.readFileSync(path.join(__dirname, 'fixtures/footer.html'), 'utf8');
const enhance = fs.readFileSync(path.join(__dirname, '../../theme/src/js/footer.js'), 'utf8').replace('export function', 'function');
function markup(captcha = true) {
  const content = captcha ? footer : footer.replace(/<fieldset class="box box-sm box-bg-default">[\s\S]*?<\/fieldset>/, '');
  return `<!doctype html><html class="as-theme" lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body class="ums_forms_redesign--on ums_page_element_headings--on">${content}</body></html>`;
}

test('footer preserves the original form, field values, links and merchant text on repeated enhancement', async ({page}) => {
  await page.setContent(markup());
  await page.evaluate(() => {
    const form = document.querySelector('#formNewsletterWidget');
    const links = [...document.querySelectorAll('#footer a')];
    document.querySelector('#newsletterWidget').value = 'rozpracovany@example.test';
    document.querySelector('.newsletter-header h3 span').textContent = 'Vlastní nadpis obchodníka';
    window.footerBefore = {form, fields:[...form.elements], values:[...form.elements].map(e=>e.value), links, hrefs:links.map(e=>e.getAttribute('href')), photo:document.querySelector('.contact-box > img')};
  });
  await page.addScriptTag({content: `${enhance}\nenhanceFooter();enhanceFooter();`});
  expect(await page.evaluate(() => {
    const before = window.footerBefore;
    return before.form === document.querySelector('#formNewsletterWidget')
      && before.fields.every((e,i)=>before.form.contains(e) && e.value===before.values[i])
      && before.links.every((e,i)=>document.contains(e) && e.getAttribute('href')===before.hrefs[i])
      && before.photo === document.querySelector('.contact-box > img');
  })).toBe(true);
  await expect(page.locator('#formNewsletterWidget')).toHaveAttribute('action', '/action/MailForm/subscribeToNewsletters/');
  await expect(page.locator('#newsletterWidgetCaptcha')).toBeVisible();
  await expect(page.locator('.newsletter-header h3 span')).toHaveText('Vlastní nadpis obchodníka');
  await expect(page.locator('.as-footer-socials .social-icon')).toHaveCount(3);
  await expect(page.locator('.as-footer-meta')).toHaveCount(1);
  await expect(page.locator('.as-footer-newsletter-art')).toHaveCount(1);
  await expect(page.locator('.custom-footer__instagram')).toBeHidden();
});

test('footer stays within the page across breakpoints, with and without CAPTCHA', async ({browser}) => {
  for (const captcha of [true, false]) {
    // Vlastní stránka: setContent ponechává window a druhé vložení skriptu by spadlo na const LABELS.
    const page = await browser.newPage();
    await page.setContent(markup(captcha));
    await page.addScriptTag({content: `${enhance}\nenhanceFooter();`});
    for (const width of [320,390,479,480,767,768,991,992,1199,1200,1920]) {
      await page.setViewportSize({width,height:900});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth), `${width}, captcha=${captcha}`).toBeLessThanOrEqual(1);
      const contact = await page.locator('.custom-footer__contact').boundingBox();
      const newsletter = await page.locator('.custom-footer__newsletter').boundingBox();
      if (width < 992) expect(newsletter.y).toBeGreaterThanOrEqual(contact.y+contact.height);
      else expect(newsletter.y).toBe(contact.y);
      const email = await page.locator('#newsletterWidget').boundingBox();
      const button = await page.locator('.subscribe-form button').boundingBox();
      if (captcha || width < 480) expect(button.y).toBeGreaterThanOrEqual(email.y+email.height);
      else {
        expect(button.y).toBeGreaterThanOrEqual(email.y);
        expect(button.y+button.height).toBeLessThanOrEqual(email.y+email.height);
      }
      expect(button.x+button.width).toBeLessThanOrEqual(width);
      await expect(page.locator('#signature')).toBeVisible();
      await expect(page.locator('.as-footer-socials a').first()).toBeVisible();
    }
    await page.close();
  }
});
