// Skutečné HTML Shoptetu bez skriptů/tajných hodnot. Serverové přepočty se ověřují zvlášť živě.
const fs=require('node:fs');
const path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const fixture=fs.readFileSync(path.join(__dirname,'fixtures/checkout-step2.html'),'utf8');
const css=name=>fs.readFileSync(path.join(dist,name+'.css'),'utf8').replace(/<\/style/gi,'%3C/style');
for(const variant of ['v1','v2'])test(`native checkout fits both headers without changing the form contracts: ${variant}`,async({page})=>{
 const html=fixture.replaceAll('Dřevěný přívěsek Bracken Pendant','Dlouhý název výrobku s podrobnými informacemi '.repeat(5)).replaceAll('285 Kč','123 456 789 Kč');
 await page.setContent(`<!doctype html><html class="as-theme as-header-${variant} as-account-in-header"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css('base-blank')}${css('asteroid')}${css('header-'+variant)}</style></head><body class="ordering-process in-krok-1 ums_forms_redesign--on">${html}</body></html>`);
 await expect(page.locator('#order-form')).toHaveAttribute('action','/action/orderingProcess/Step1Validate/');
 await expect(page.locator('#orderFormButton')).toHaveAttribute('form','order-form');
 await expect(page.locator('#payment-currency')).toHaveAttribute('name','currency');
 await page.locator('#billingId-5').check();
 await expect(page.locator('#billingId-5')).toBeChecked();
 for(const step of ['in-krok-1']){
  await page.evaluate(step=>{document.body.classList.remove('in-krok-1','in-krok-2');document.body.classList.add(step);},step);
  for(const width of [320,390,479,480,767,768,991,992,1199,1200,1920]){
   await page.setViewportSize({width,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),`${step}/${width}`).toBeLessThanOrEqual(1);
   await expect(page.locator('#header .search')).toBeHidden();
   await expect(page.locator('#header .header-bottom')).toBeHidden();
   await expect(page.locator('.top-navigation-tools .top-nav-button-login')).toBeVisible();
   await expect(page.locator('#orderFormButton')).toBeVisible();
   const logo=await page.locator('#header .site-name').boundingBox(),tools=await page.locator('.top-navigation-tools').boundingBox();
   expect(logo.x+logo.width).toBeLessThanOrEqual(tools.x);
  }
 }
});
