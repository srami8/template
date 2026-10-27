// Regrese skutečných konfliktních selektorů Disca vyžaduje .desktop i skutečný :hover.
const fs=require('node:fs');
const path=require('node:path');
const {test,expect}=require('@playwright/test');
const dist=process.env.RESPONSIVE_THEME_DIST||path.join(__dirname,'../../theme/dist');
const native=fs.readFileSync(path.join(__dirname,'fixtures/checkout-step2.html'),'utf8');
const code=fs.readFileSync(path.join(__dirname,'../../theme/src/js/checkout.js'),'utf8').replace('export function','function');
const contact=`<div class="contact-box"><img src="https://shop.test/avatar.svg" alt="Kontakt"><strong>Podpora</strong><ul><li><span class="mail"><a href="mailto:podpora@example.invalid">podpora@example.invalid</a></span></li><li><span class="tel"><a href="tel:+420000000000">+420 000 000 000</a></span></li></ul></div>`;
async function load(page,variant='v1'){
 const css=['base-blank','asteroid','header-'+variant].map(n=>fs.readFileSync(path.join(dist,n+'.css'),'utf8').replace(/<\/style/gi,'%3C/style')).join('\n');
// Rychlé odkazy dává js/header.js na telefonu do menu; bez skriptu je fixture vynechá.
 const html=native.replace(/<nav class="as-quicklinks"[\s\S]*?<\/nav>/,'').replace(/<div class="contact-box"[^>]*>[\s\S]*?<\/div>/,contact).replace('<div class="top-navigation-tools">','<a class="as-topbar-phone" href="tel:+420000000000"><strong>+420 000 000 000</strong> (po–pá 9:00–17:00)</a><div class="top-navigation-tools">');
 await page.route('https://shop.test/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/>'}));
 await page.setContent(`<!doctype html><html class="as-theme as-header-${variant}" lang="cs"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body class="desktop in-krok-1 ordering-process ums_forms_redesign--on">${html}</body></html>`);
 await page.addScriptTag({content:code+'\nenhanceCheckout();'});
}
for(const variant of ['v1','v2'])test(`checkout header has one vertical center and contact uses native nodes: ${variant}`,async({page})=>{
 await load(page,variant);
 await expect(page.getByRole('heading',{name:'Potřebujete poradit?',exact:true})).toBeVisible();
 await expect(page.locator('.checkout-box .box.box-sm')).toBeVisible();
 await expect(page.locator('.contact-box a[href^="tel:"]')).toHaveCount(1);
 const form=await page.locator('#order-form').getAttribute('action');
 for(const width of [320,390,767,768,991,1199,1510,1920,2560]){
  await page.setViewportSize({width,height:1080});
  if(width<768){
   // Telefon: kompaktní hlavička jako v košíku (Figma 1686:10094), menu, logo, lupa a účet v řádku 56 px.
   const mobile=await page.evaluate(()=>{const center=q=>{const r=document.querySelector(q).getBoundingClientRect();return Math.round(r.top+r.height/2);};return {header:Math.round(document.getElementById('header').getBoundingClientRect().height),centers:['#header [data-target="navigation"]','#header .site-name','#header [data-target="search"]','#header .as-account-button'].map(center),contactRight:document.querySelector('.checkout-box').getBoundingClientRect().right,overflow:document.documentElement.scrollWidth-innerWidth};});
   expect(mobile.header,String(width)).toBe(56);
   expect(new Set(mobile.centers).size,String(width)).toBe(1);
   await expect(page.locator('.top-navigation-bar')).toBeHidden();
   expect(mobile.contactRight).toBeLessThanOrEqual(width);
   expect(mobile.overflow).toBeLessThanOrEqual(1);
   continue;
  }
  const layout=await page.evaluate(()=>{const r=q=>document.querySelector(q).getBoundingClientRect(),logo=r('.site-name'),tools=r('.top-navigation-tools'),phone=r('.as-topbar-phone'),head=r('#header'),contact=r('.checkout-box');return {logoY:logo.top+logo.height/2,toolsY:tools.top+tools.height/2,phoneY:phone.top+phone.height/2,phoneBottom:phone.bottom,headerBottom:head.bottom,overlap:logo.right>tools.left,contactRight:contact.right,overflow:document.documentElement.scrollWidth-innerWidth};});
  expect(Math.abs(layout.logoY-layout.toolsY)).toBeLessThan(.1);
  expect(Math.abs(layout.logoY-layout.phoneY)).toBeLessThan(.1);
  expect(layout.phoneBottom).toBeLessThanOrEqual(layout.headerBottom);
  expect(layout.overlap).toBe(false);
  expect(layout.contactRight).toBeLessThanOrEqual(width);
  expect(layout.overflow).toBeLessThanOrEqual(1);
 }
 await expect(page.locator('#order-form')).toHaveAttribute('action',form);
});
test('hover never resizes or shifts shipping/payment cards or adds an outer rectangular shadow',async({page})=>{
 await load(page);
 await page.setViewportSize({width:1920,height:1080});
 const rects=()=>page.locator('.shipping-billing-table .radio-wrapper').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}));
 const before=await rects();
 for(const row of await page.locator('.shipping-billing-table .radio-wrapper').all()){
  await row.hover();
  expect(await rects()).toEqual(before);
  const style=await row.evaluate(e=>({border:getComputedStyle(e).borderWidth,shadow:getComputedStyle(e).boxShadow,radius:getComputedStyle(e.querySelector('label')).borderRadius}));
  expect(style).toEqual({border:'0px',shadow:'none',radius:'10px'});
 }
});
