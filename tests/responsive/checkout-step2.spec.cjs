// Skutečné HTML Shoptetu bez skriptů/tajných hodnot. Serverové přepočty se ověřují zvlášť živě.
const fs=require('node:fs');
const path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const fixture=fs.readFileSync(path.join(__dirname,'fixtures/checkout-step2.html'),'utf8');
const css=name=>fs.readFileSync(path.join(dist,name+'.css'),'utf8').replace(/<\/style/gi,'%3C/style');
for(const variant of ['v1','v2'])test(`native checkout fits both headers without changing the form contracts: ${variant}`,async({page})=>{
 const html=fixture.replaceAll('Dřevěný přívěsek Bracken Pendant','Dlouhý název výrobku s podrobnými informacemi '.repeat(5)).replaceAll('285 Kč','123 456 789 Kč');
 await page.setContent(`<!doctype html><html class="as-theme as-header-${variant} as-account-in-header"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css('base-blank')}${css('asteroid')}${css('header-'+variant)}</style></head><body class="desktop id--16 ordering-process in-krok-1 ums_forms_redesign--on">${html}</body></html>`);
 await expect(page.locator('#order-form')).toHaveAttribute('action','/action/orderingProcess/Step1Validate/');
 await expect(page.locator('#orderFormButton')).toHaveAttribute('form','order-form');
 await expect(page.locator('#payment-currency')).toHaveAttribute('name','currency');
 await page.locator('label[for="billingId-5"]').click();
 await expect(page.locator('#billingId-5')).toBeChecked();
 for(const step of ['in-krok-1']){
  await page.evaluate(step=>{document.body.classList.remove('in-krok-1','in-krok-2');document.body.classList.add(step);},step);
  for(const width of [320,390,479,480,767,768,991,992,1199,1200,1920]){
   await page.setViewportSize({width,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),`${step}/${width}`).toBeLessThanOrEqual(1);
   await expect(page.locator('#header .search')).toBeHidden();
   await expect(page.locator('#orderFormButton')).toBeVisible();
   if(width<768){
    // Telefon: kompaktní hlavička jako v košíku, účet v řádku hlavičky.
    for(const sel of ['[data-target="navigation"]','[data-target="search"]','.as-account-button'])await expect(page.locator(`#header ${sel}`)).toBeVisible();
    // Disco v krocích 2 a 3 (id--16/17) menu i hledání skrývá; na telefonu musí fungovat jako v košíku.
    await page.evaluate(()=>document.body.classList.add('navigation-window-visible'));
    await expect(page.locator('#navigation')).toBeVisible();
    await page.evaluate(()=>{document.body.classList.remove('navigation-window-visible');document.body.classList.add('search-window-visible');});
    await expect(page.locator('#header .search-input')).toBeVisible();
    await page.evaluate(()=>document.body.classList.remove('search-window-visible'));
    continue;
   }
   await expect(page.locator('#header .header-bottom')).toBeHidden();
   await expect(page.locator('.top-navigation-tools .top-nav-button-login')).toBeVisible();
   const logo=await page.locator('#header .site-name').boundingBox(),tools=await page.locator('.top-navigation-tools').boundingBox();
   expect(logo.x+logo.width).toBeLessThanOrEqual(tools.x);
  }
 }
});

// Stub představuje pouze dokumentovanou nativní mousedown vazbu, ne cenu ani AJAX.
test('keyboard change reaches native wrapper exactly once and pointer change is not duplicated',async({page})=>{
 const code=fs.readFileSync(path.join(__dirname,'../../theme/src/js/checkout.js'),'utf8').replace('export function','function');
 await page.setContent('<body class="in-krok-1"><div class="shipping-billing-table"><div class="radio-wrapper active"><input type="radio" name="billingId" id="a" checked><label for="a">A</label></div><div class="radio-wrapper"><input type="radio" name="billingId" id="b"><label for="b">B</label></div><div class="radio-wrapper"><input type="radio" name="billingId" id="c" disabled><label for="c">C</label></div></div></body>');
 await page.addScriptTag({content:`window.nativeCalls=0; document.querySelectorAll('.radio-wrapper').forEach(row=>row.addEventListener('mousedown',()=>{window.nativeCalls++;document.querySelectorAll('.radio-wrapper').forEach(r=>r.classList.remove('active'));row.classList.add('active');row.querySelector('input').checked=true;}));${code}\nenhanceCheckout();`});
 await page.locator('#b').press('Space');
 expect(await page.evaluate(()=>window.nativeCalls)).toBe(1);
 await expect(page.locator('#b')).toBeChecked();
 await page.locator('label[for=a]').click();
 expect(await page.evaluate(()=>window.nativeCalls)).toBe(2);
});
