const fs=require('node:fs'),path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const css=['base-blank.css','asteroid.css'].map(n=>fs.readFileSync(path.join(dist,n),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
const step2=fs.readFileSync(path.join(__dirname,'fixtures/checkout-step2.html'),'utf8');
const sidebar3=fs.readFileSync(path.join(__dirname,'fixtures/checkout-summary-step3.html'),'utf8');
async function load(page,step){
 const content=step===2?step2:`<div id="content-wrapper"><main id="content"><form id="order-form" action="/action/orderingProcess/Step2Validate/" method="post"><div class="cart-inner"><div class="cart-row"><div id="checkoutContent"><input name="fullName" value="" required></div>${sidebar3}</div></div></form></main></div>`;
 await page.route('https://shop.test/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/>'}));
 await page.setContent(`<!doctype html><html class="as-theme"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body class="desktop ordering-process in-krok-${step-1} ums_forms_redesign--on">${content}</body></html>`);
 // Stejná kontaktní data v obou nativních strukturách pro porovnání vzhledu.
 if(step===2)await page.evaluate(html=>{const t=document.createElement('template');t.innerHTML=html;document.querySelector('#checkoutSidebar .checkout-box').replaceWith(t.content.querySelector('.checkout-box'));},sidebar3);
}
test('both native checkout summaries share typography and layout',async({page})=>{
 const samples={};
 for(const step of [2,3]){
  await load(page,step);await page.setViewportSize({width:1920,height:1080});
  samples[step]=await page.evaluate(()=>['#summary-box > h2','.cart-item-name > a','.cart-item-price','.price-wrapper .price.price-primary','.checkout-box .toggle-contacts','.checkout-box .tel a'].map(q=>{const s=getComputedStyle(document.querySelector('#checkoutSidebar '+q));return [s.fontSize,s.lineHeight,s.color,s.fontWeight];}));
 }
 expect(samples[3]).toEqual(samples[2]);
});
test('final summary fits while retaining native consents, final label and submit form',async({page})=>{
 await load(page,3);
 for(const width of [320,390,479,480,767,768,991,992,1199,1200,1920]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),String(width)).toBeLessThanOrEqual(1);
  await expect(page.locator('#submit-order .order-button-suffix')).toBeVisible();
  await expect(page.locator('#submit-order')).toContainText('s povinností platby');
  await expect(page.locator('.consents a[href="/obchodni-podminky/"]')).toBeVisible();
  await expect(page.locator('#consentsproductRatingRequestOptOut')).not.toBeChecked();
  expect(await page.locator('#submit-order').evaluate(e=>e.form.id)).toBe('order-form');
  expect(await page.locator('#consentsproductRatingRequestOptOut').evaluate(e=>e.form.id)).toBe('order-form');
  const b=await page.locator('#submit-order').boundingBox();expect(b.x+b.width).toBeLessThanOrEqual(width);
 }
 await expect(page.locator('#order-form')).toHaveAttribute('action','/action/orderingProcess/Step2Validate/');
});
